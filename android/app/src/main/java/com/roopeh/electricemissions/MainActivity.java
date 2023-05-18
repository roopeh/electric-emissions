package com.roopeh.electricemissions;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageButton;
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

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.DialogFragment;

public class MainActivity extends AppCompatActivity
        implements DatePickerInterface, ApiResponseInterface, LoadingDialogInterface {
    private LineChart mGraphChart = null;
    private LineDataSet mConsumedDataset = null;
    private LineDataSet mProductionDataset = null;
    private ArrayList<Entry> mConsumedEmissions = null;
    private ArrayList<Entry> mProductionEmissions = null;

    private Button mStartDateButton = null;
    private Button mEndDateButton = null;

    private TextView mCurrentConsumedVal = null;
    private TextView mCurrentProductionVal = null;
    private Button mRefreshEmissionsButton = null;

    final private Locale mFinnishLocale = new Locale("fi", "FI");

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
        mRefreshEmissionsButton = findViewById(R.id.buttonRefresh);

        mConsumedEmissions = new ArrayList<>();
        mProductionEmissions = new ArrayList<>();

        // Load saved graph emissions
        if (savedInstanceState != null) {
            final ArrayList<Entry> consumedEmissions = savedInstanceState.getParcelableArrayList("consumedData", Entry.class);
            if (consumedEmissions != null) {
                mConsumedEmissions = consumedEmissions;
            }
            final ArrayList<Entry> productionEmissions = savedInstanceState.getParcelableArrayList("productionData", Entry.class);
            if (productionEmissions != null) {
                mProductionEmissions = productionEmissions;
            }
        }

        // Fixed date buttons
        final Button mButtonFixedToday = findViewById(R.id.buttonFixedToday);
        final Button mButtonFixed3days = findViewById(R.id.buttonFixed3days);
        final Button mButtonFixed7days = findViewById(R.id.buttonFixed7days);
        final Button mButtonFixed14days = findViewById(R.id.buttonFixed14days);
        final Button mButtonFixed30days = findViewById(R.id.buttonFixed30days);
        final Button mButtonFixed90days = findViewById(R.id.buttonFixed90days);

        // Locale buttons
        final ImageButton mEnglishButton = findViewById(R.id.buttonLocaleGb);
        final ImageButton mFinnishButton = findViewById(R.id.buttonLocaleFi);

        // Set selected locale
        final Locale selectedLocale = LocalStore.getInstance().getSelectedLanguage();
        if (selectedLocale == Locale.ENGLISH) {
            mEnglishButton.setBackgroundResource(R.drawable.bordered_box);
        } else if (selectedLocale.getCountry().equalsIgnoreCase("FI")) {
            mFinnishButton.setBackgroundResource(R.drawable.bordered_box);
        }

        // Initialize date pickers
        final String datePickerPattern = selectedLocale == Locale.ENGLISH ? "MM/dd/yyyy" : "dd.MM.yyyy";
        mDateButtonFormatter = DateTimeFormatter.ofPattern(datePickerPattern, selectedLocale);
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
        mGraphChart.getXAxis().setLabelCount(Math.min(mConsumedEmissions.size(), 15), true);

        // Apply a custom marker
        final ChartMarker chartMarker = new ChartMarker(getApplicationContext(), R.layout.chart_marker_view);
        chartMarker.setChartView(mGraphChart);
        mGraphChart.setMarker(chartMarker);

        mConsumedDataset = new LineDataSet(mConsumedEmissions, getResources().getString(R.string.consumedEmissions));
        mConsumedDataset.setDrawIcons(false);
        mConsumedDataset.setColor(getResources().getColor(R.color.consumedEmissions, getTheme()));
        mConsumedDataset.setCircleColor(getResources().getColor(R.color.consumedEmissions, getTheme()));
        mConsumedDataset.setLineWidth(3f);
        mConsumedDataset.setDrawCircleHole(false);

        mProductionDataset = new LineDataSet(mProductionEmissions, getResources().getString(R.string.productionEmissions));
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
        ApiConnector.loadCurrentData(this, mConsumedEmissions.isEmpty() && mProductionEmissions.isEmpty());
        // Fetch graph data only if current datasets are empty
        if (mConsumedEmissions.isEmpty() && mProductionEmissions.isEmpty())
            fetchGraphData();

        mRefreshEmissionsButton.setOnClickListener(v -> ApiConnector.loadCurrentData(this, false));

        // Date pickers listeners
        mStartDateButton.setOnClickListener(v -> showDatePickerDialog(true));
        mEndDateButton.setOnClickListener(v -> showDatePickerDialog(false));

        // Fixed date buttons
        mButtonFixedToday.setOnClickListener(v -> chooseFixedLastDays(0));
        mButtonFixed3days.setOnClickListener(v -> chooseFixedLastDays(3));
        mButtonFixed7days.setOnClickListener(v -> chooseFixedLastDays(7));
        mButtonFixed14days.setOnClickListener(v -> chooseFixedLastDays(14));
        mButtonFixed30days.setOnClickListener(v -> chooseFixedLastDays(30));
        mButtonFixed90days.setOnClickListener(v -> chooseFixedLastDays(90));

        // Locale buttons
        mEnglishButton.setOnClickListener(v -> changeLanguage(Locale.ENGLISH));
        mFinnishButton.setOnClickListener(v -> changeLanguage(mFinnishLocale));
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        // Save graph emissions
        outState.putParcelableArrayList("consumedData", mConsumedEmissions);
        outState.putParcelableArrayList("productionData", mProductionEmissions);
    }

    @Override
    protected void attachBaseContext(Context newBase) {
        final Context context = ContextWrapper.wrap(newBase, LocalStore.getInstance().getSelectedLanguage());
        super.attachBaseContext(context);
    }

    private void changeLanguage(Locale locale) {
        LocalStore.getInstance().setSelectedLanguage(locale);
        recreate();
    }

    private void updateDate(ZonedDateTime dateTime, boolean isStartDate) {
        final boolean didDateChange;
        if (isStartDate) {
            final ZonedDateTime validDate = (!dateTime.isAfter(LocalStore.getInstance().getEndDate())
                    ? dateTime
                    : LocalStore.getInstance().getEndDate())
                    .withHour(0).withMinute(0).withSecond(0);
            didDateChange = !validDate.equals(LocalStore.getInstance().getStartDate());
            LocalStore.getInstance().setStartDate(validDate);
        } else {
            final ZonedDateTime validDate = (!LocalStore.getInstance().getStartDate().isAfter(dateTime)
                    ? dateTime
                    : LocalStore.getInstance().getStartDate())
                    .withHour(23).withMinute(59).withSecond(59);
            didDateChange = !validDate.equals(LocalStore.getInstance().getEndDate());
            LocalStore.getInstance().setEndDate(validDate);
        }

        updateDateButtonTexts();
        // Fetch data from api only if dates changed
        if (didDateChange) {
            fetchGraphData();
        }
    }

    private void updateDateButtonTexts() {
        mStartDateButton.setText(LocalStore.getInstance().getStartDate().format(mDateButtonFormatter));
        mEndDateButton.setText(LocalStore.getInstance().getEndDate().format(mDateButtonFormatter));
    }

    private void fetchGraphData() {
        if (ApiConnector.useSampleData) {
            ApiConnector.getSampleDataFromFile(this, this, "consumed.json");
            ApiConnector.getSampleDataFromFile(this, this, "production.json");
        } else {
            ApiConnector.loadConsumedData(this);
            ApiConnector.loadProductionData(this);
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

    private void chooseFixedLastDays(int days) {
        LocalStore.getInstance().setEndDate(LocalDate.now().atTime(23, 59, 59).atZone(TimeZone.getDefault().toZoneId()));
        final ZonedDateTime newStartDate = LocalDate.now().atTime(0, 0, 0).atZone(TimeZone.getDefault().toZoneId())
                .minusDays(days);

        updateDate(newStartDate, true);
    }

    private void showDatePickerDialog(boolean isStartDateButton) {
        final ZonedDateTime dateTime = isStartDateButton
                ? LocalStore.getInstance().getStartDate()
                : LocalStore.getInstance().getEndDate();
        final DialogFragment fragment = new DatePickerFragment(this, dateTime, isStartDateButton);
        fragment.show(getSupportFragmentManager(), "datePicker");
    }

    @Override
    public void onDateChanged(ZonedDateTime dateTime, boolean isStartDate) {
        updateDate(dateTime, isStartDate);
    }

    @Override
    public void onApiResponse(ApiConnector.ResponseTypes apiResponseType, ArrayList<RawEmissionEntry> rawEmissions, boolean isCached) {
        final int forceLabelCount;
        switch (apiResponseType) {
            case CONSUMED_EMISSIONS:
            case PRODUCTION_EMISSIONS: {
                final ArrayList<Entry> emissions = ApiConnector.parseEntriesFromRawEmissions(rawEmissions);
                if (apiResponseType == ApiConnector.ResponseTypes.CONSUMED_EMISSIONS) {
                    mConsumedDataset.setValues(emissions);
                    mConsumedEmissions = emissions;
                } else {
                    mProductionDataset.setValues(emissions);
                    mProductionEmissions = emissions;
                }
                forceLabelCount = Math.min(emissions.size(), 15);
            } break;
            // Current emissions
            default: {
                // Update last updated time
                final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ", Locale.getDefault());
                final ZonedDateTime lastRefreshTime = ZonedDateTime.parse(rawEmissions.get(0).getStartTime(), formatter);
                mRefreshEmissionsButton.setText(String.format(getResources().getString(R.string.currentUpdatedAt),
                        lastRefreshTime.getHour(), lastRefreshTime.getMinute()));

                // Set current emissions
                rawEmissions.forEach(e -> {
                    if (e.getVariableId() == 265) {
                        mCurrentConsumedVal.setText(String.valueOf(e.getValue()));
                    } else {
                        mCurrentProductionVal.setText(String.valueOf(e.getValue()));
                    }
                });

                // Refresh graph datasets if last selected day matches current day and if new values were fetched
                if (!isCached) {
                    final ZonedDateTime curDate = ZonedDateTime.now();
                    if (curDate.getDayOfMonth() == LocalStore.getInstance().getEndDate().getDayOfMonth()
                            && curDate.getMonth() == LocalStore.getInstance().getEndDate().getMonth()
                            && curDate.getYear() == LocalStore.getInstance().getEndDate().getYear()) {
                        fetchGraphData();
                    }
                }
            } return;
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
