package com.roopeh.electricemissions;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.Legend;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;
import com.github.mikephil.charting.interfaces.datasets.ILineDataSet;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Locale;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.DialogFragment;

public class MainActivity extends AppCompatActivity
        implements DatePickerInterface {
    private LineChart mGraphChart = null;
    private Button mStartDateButton = null;
    private Button mEndDateButton = null;
    private SimpleDateFormat mDateButtonFormatter = null;

    private Calendar mStartDate = null;
    private Calendar mEndDate= null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mGraphChart = findViewById(R.id.graphChart);
        mStartDateButton = findViewById(R.id.buttonStartDate);
        mEndDateButton = findViewById(R.id.buttonEndDate);

        // Initialize dates
        mStartDate = Calendar.getInstance();
        mEndDate = mStartDate;
        mDateButtonFormatter = new SimpleDateFormat("MM/dd/yyyy", Locale.ENGLISH);
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

        // Sample consumed data
        final ArrayList<EmissionEntry> consumedData = ApiConnector.getSampleDataFromFile(getApplicationContext(), "consumed.json");
        final ArrayList<Entry> consumedList = new ArrayList<>();
        for (int i = 0; i < consumedData.size(); ++i) {
            final EmissionEntry row = consumedData.get(i);
            consumedList.add(new Entry(row.getUnixTime(), row.getValue()));
        }

        // Sample production data
        final ArrayList<EmissionEntry> productionData = ApiConnector.getSampleDataFromFile(getApplicationContext(), "production.json");
        final ArrayList<Entry> productionList = new ArrayList<>();
        for (int i = 0; i < productionData.size(); ++i) {
            final EmissionEntry row = productionData.get(i);
            productionList.add(new Entry(row.getUnixTime(), row.getValue()));
        }

        final int forceLabelCount = Math.min(consumedData.size(), 15);
        mGraphChart.getXAxis().setLabelCount(forceLabelCount, true);

        final LineDataSet consumedDataset = new LineDataSet(consumedList, "Consumed emissions");
        consumedDataset.setDrawIcons(false);
        consumedDataset.setColor(getResources().getColor(R.color.consumedEmissions, getTheme()));
        consumedDataset.setCircleColor(getResources().getColor(R.color.consumedEmissions, getTheme()));
        consumedDataset.setLineWidth(3f);
        consumedDataset.setDrawCircleHole(false);

        final LineDataSet productionDataset = new LineDataSet(productionList, "Production emissions");
        productionDataset.setDrawIcons(false);
        productionDataset.setColor(getResources().getColor(R.color.productionEmissions, getTheme()));
        productionDataset.setCircleColor(getResources().getColor(R.color.productionEmissions, getTheme()));
        productionDataset.setLineWidth(3f);
        productionDataset.setDrawCircleHole(false);

        final ArrayList<ILineDataSet> dataSets = new ArrayList<>();
        dataSets.add(consumedDataset);
        dataSets.add(productionDataset);
        mGraphChart.setData(new LineData(dataSets));

        // Date pickers listeners
        mStartDateButton.setOnClickListener(v -> showDatePickerDialog(true));
        mEndDateButton.setOnClickListener(v -> showDatePickerDialog(false));
    }

    private void updateDateButtonTexts() {
        mStartDateButton.setText(mDateButtonFormatter.format(mStartDate.getTimeInMillis()));
        mEndDateButton.setText(mDateButtonFormatter.format(mEndDate.getTimeInMillis()));
    }

    private void showDatePickerDialog(boolean isStartDateButton) {
        final Calendar calendar = isStartDateButton ? mStartDate : mEndDate;
        final DialogFragment fragment = new DatePickerFragment(this, calendar, isStartDateButton);
        fragment.show(getSupportFragmentManager(), "datePicker");
    }

    private boolean isFirstDateSmallerThanSecond(Calendar c1, Calendar c2) {
        return c1.get(Calendar.YEAR) <= c2.get(Calendar.YEAR)
                && c1.get(Calendar.MONTH) <= c2.get(Calendar.MONTH)
                && c1.get(Calendar.DAY_OF_MONTH) <= c2.get(Calendar.DAY_OF_MONTH)
                && c1.get(Calendar.DAY_OF_MONTH) != c2.get(Calendar.DAY_OF_MONTH);
    }

    private boolean didDateChange(Calendar c1, Calendar c2) {
        return c1.get(Calendar.YEAR) != c2.get(Calendar.YEAR)
                || c1.get(Calendar.MONTH) != c2.get(Calendar.MONTH)
                || c1.get(Calendar.DAY_OF_MONTH) != c2.get(Calendar.DAY_OF_MONTH);
    }

    @Override
    public void onDateChanged(Calendar calendar, boolean isStartDate) {
        final boolean didDateChange;
        if (isStartDate) {
            final Calendar validDate = isFirstDateSmallerThanSecond(calendar, mEndDate)
                    ? calendar
                    : mEndDate;
            didDateChange = didDateChange(validDate, mStartDate);
            mStartDate = validDate;
            // Set start time to midnight
            mStartDate.set(Calendar.HOUR_OF_DAY, 0);
            mStartDate.set(Calendar.MINUTE, 0);
        } else {
            final Calendar validDate = isFirstDateSmallerThanSecond(mStartDate, calendar)
                    ? calendar
                    : mStartDate;
            didDateChange = didDateChange(validDate, mEndDate);
            mEndDate = validDate;
            // Set end time to midnight
            mEndDate.set(Calendar.HOUR_OF_DAY, 23);
            mEndDate.set(Calendar.MINUTE, 59);
        }

        updateDateButtonTexts();
        // Fetch data from api only if dates changed
        if (didDateChange) {
            Log.d("DEBUG_TAG", "date changed");
        }
    }
}
