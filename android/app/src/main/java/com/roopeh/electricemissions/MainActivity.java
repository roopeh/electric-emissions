package com.roopeh.electricemissions;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.Legend;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;
import com.github.mikephil.charting.interfaces.datasets.ILineDataSet;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Locale;
import java.util.TimeZone;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.DialogFragment;

public class MainActivity extends AppCompatActivity
        implements DatePickerInterface, ApiResponseInterface, LoadingDialogInterface {
    private LineChart mGraphChart = null;
    private LineDataSet mConsumedDataset = null;
    private LineDataSet mProductionDataset = null;

    private Button mStartDateButton = null;
    private Button mEndDateButton = null;

    private TextView mCurrentConsumedVal = null;
    private TextView mCurrentProductionVal = null;

    private ZonedDateTime mStartDate = null;
    private ZonedDateTime mEndDate = null;
    private DateTimeFormatter mDateButtonFormatter = null;

    private LoadingDialog mLoadingDialog = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mGraphChart = findViewById(R.id.graphChart);
        mStartDateButton = findViewById(R.id.buttonStartDate);
        mEndDateButton = findViewById(R.id.buttonEndDate);
        mCurrentConsumedVal = findViewById(R.id.textConsumedValue);
        mCurrentProductionVal = findViewById(R.id.textProductionValue);

        // Initialize dates
        mStartDate = LocalDate.now().atTime(0, 0, 0).atZone(TimeZone.getDefault().toZoneId());
        mEndDate = LocalDate.now().atTime(23, 59, 59).atZone(TimeZone.getDefault().toZoneId());
        mDateButtonFormatter = DateTimeFormatter.ofPattern("MM/dd/yyyy", Locale.ENGLISH);
        updateDateButtonTexts();

        // Initialize api connector
        ApiConnector.initializeApiConnector();

        // Initialize chart view
        mGraphChart.getDescription().setEnabled(false);
        mGraphChart.setTouchEnabled(true);
        mGraphChart.setPinchZoom(true);

        mGraphChart.getLegend().setVerticalAlignment(Legend.LegendVerticalAlignment.TOP);
        mGraphChart.getLegend().setHorizontalAlignment(Legend.LegendHorizontalAlignment.CENTER);

        mGraphChart.getXAxis().setPosition(XAxis.XAxisPosition.BOTTOM);
        mGraphChart.getXAxis().setLabelRotationAngle(-50f);
        mGraphChart.getXAxis().setValueFormatter(new ChartXAxisDateConverter());

        // Apply a custom marker
        final ChartMarker chartMarker = new ChartMarker(getApplicationContext(), R.layout.chart_marker_view);
        chartMarker.setChartView(mGraphChart);
        mGraphChart.setMarker(chartMarker);

        mConsumedDataset = new LineDataSet(new ArrayList<>(), "Consumed emissions");
        mConsumedDataset.setDrawIcons(false);
        mConsumedDataset.setColor(getResources().getColor(R.color.consumedEmissions, getTheme()));
        mConsumedDataset.setCircleColor(getResources().getColor(R.color.consumedEmissions, getTheme()));
        mConsumedDataset.setLineWidth(3f);
        mConsumedDataset.setDrawCircleHole(false);

        mProductionDataset = new LineDataSet(new ArrayList<>(), "Production emissions");
        mProductionDataset.setDrawIcons(false);
        mProductionDataset.setColor(getResources().getColor(R.color.productionEmissions, getTheme()));
        mProductionDataset.setCircleColor(getResources().getColor(R.color.productionEmissions, getTheme()));
        mProductionDataset.setLineWidth(3f);
        mProductionDataset.setDrawCircleHole(false);

        final ArrayList<ILineDataSet> dataSets = new ArrayList<>();
        dataSets.add(mConsumedDataset);
        dataSets.add(mProductionDataset);
        mGraphChart.setData(new LineData(dataSets));

        // Fetch initial data
        fetchGraphData();
        ApiConnector.loadCurrentData(this);

        // Date pickers listeners
        mStartDateButton.setOnClickListener(v -> showDatePickerDialog(true));
        mEndDateButton.setOnClickListener(v -> showDatePickerDialog(false));
    }

    private void updateDateButtonTexts() {
        mStartDateButton.setText(mStartDate.format(mDateButtonFormatter));
        mEndDateButton.setText(mEndDate.format(mDateButtonFormatter));
    }

    private void fetchGraphData() {
        Log.d("DEBUG_TAG", "Fetching data");
        if (ApiConnector.useSampleData) {
            ApiConnector.getSampleDataFromFile(this, this, "consumed.json");
            ApiConnector.getSampleDataFromFile(this, this, "production.json");
        } else {
            ApiConnector.loadConsumedData(this, mStartDate, mEndDate);
            ApiConnector.loadProductionData(this, mStartDate, mEndDate);
        }

        // Show loading dialog
        toggleLoadingDialog(true);
    }

    private void toggleLoadingDialog(boolean toggle) {
        if (toggle) {
            if (mLoadingDialog == null) {
                mLoadingDialog = new LoadingDialog(this);
                mLoadingDialog.setCancelable(false);
                mLoadingDialog.show(getSupportFragmentManager(), "loadingDialog");
            }
        } else {
            if (mLoadingDialog != null) {
                mLoadingDialog.dismiss();
                mLoadingDialog = null;
            }
        }
    }

    private void showDatePickerDialog(boolean isStartDateButton) {
        final ZonedDateTime dateTime = isStartDateButton ? mStartDate : mEndDate;
        final DialogFragment fragment = new DatePickerFragment(this, dateTime, isStartDateButton);
        fragment.show(getSupportFragmentManager(), "datePicker");
    }

    @Override
    public void onDateChanged(ZonedDateTime dateTime, boolean isStartDate) {
        final boolean didDateChange;
        if (isStartDate) {
            final ZonedDateTime validDate = (!dateTime.isAfter(mEndDate)
                    ? dateTime
                    : mEndDate)
                        .withHour(0).withMinute(0).withSecond(0);
            didDateChange = !validDate.equals(mStartDate);
            mStartDate = validDate;
        } else {
            final ZonedDateTime validDate = (!mStartDate.isAfter(dateTime)
                    ? dateTime
                    : mStartDate)
                        .withHour(23).withMinute(59).withSecond(59);
            didDateChange = !validDate.equals(mEndDate);
            mEndDate = validDate;
        }

        updateDateButtonTexts();
        // Fetch data from api only if dates changed
        if (didDateChange) {
            fetchGraphData();
        }
    }

    @Override
    public void onApiResponse(ApiConnector.ResponseTypes apiResponseType, ArrayList<RawEmissionEntry> rawEmissions) {
        final int forceLabelCount;
        switch (apiResponseType) {
            case CONSUMED_EMISSIONS:
            case PRODUCTION_EMISSIONS: {
                final ArrayList<Entry> emissions = ApiConnector.parseEntriesFromRawEmissions(rawEmissions);
                if (apiResponseType == ApiConnector.ResponseTypes.CONSUMED_EMISSIONS) {
                    mConsumedDataset.setValues(emissions);
                } else {
                    mProductionDataset.setValues(emissions);
                }
                forceLabelCount = Math.min(emissions.size(), 15);
            } break;
            // Current emissions
            default: {
                forceLabelCount = 15;
                rawEmissions.forEach(e -> {
                    if (e.getVariableId() == 265) {
                        mCurrentConsumedVal.setText("" + e.getValue());
                    } else {
                        mCurrentProductionVal.setText("" + e.getValue());
                    }
                });
            } break;
        }

        toggleLoadingDialog(false);

        mGraphChart.getXAxis().setLabelCount(forceLabelCount, true);
        mGraphChart.getData().notifyDataChanged();
        mGraphChart.notifyDataSetChanged();
        mGraphChart.invalidate();
    }

    @Override
    public void onApiError(int errCode, String errMsg) {
        // TODO: clear datasets on error?
        toggleLoadingDialog(false);
        Log.d("DEBUG_TAG", "Err code " + errCode + ": " + errMsg);
    }

    @Override
    public void onCancelLoadingDialog() {
        toggleLoadingDialog(false);
    }
}
