package com.roopeh.electricemissions;

import androidx.appcompat.app.AppCompatActivity;

import android.graphics.Color;
import android.graphics.DashPathEffect;
import android.os.Bundle;
import android.util.Log;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.Legend;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;
import com.github.mikephil.charting.interfaces.datasets.ILineDataSet;

import java.util.ArrayList;

import static com.roopeh.electricemissions.ApiConnector.getSampleConsumedData;
import static com.roopeh.electricemissions.ApiConnector.initializeApiConnector;


public class MainActivity extends AppCompatActivity {
    private LineChart mGraphChart = null;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize api connector
        initializeApiConnector();

        // Initialize chart view
        mGraphChart = findViewById(R.id.graphChart);
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

        ArrayList<EmissionEntry> foo = getSampleConsumedData(getApplicationContext());
        ArrayList<Entry> values = new ArrayList<>();
        for (int i = 0; i < foo.size(); ++i) {
            final EmissionEntry row = foo.get(i);
            values.add(new Entry(row.getUnixTime(), row.getValue()));
        }
        // Log.d("DEBUG_TAG", "time: " + foo.get(0).getUnixTime() + ", value: " + foo.get(0).getValue());

        final int cnt = mGraphChart.getXAxis().getLabelCount();
        Log.d("DEBUG_TAG", "Labels: " + cnt + ", actual count: " + foo.size());

        final LineDataSet dataSet = new LineDataSet(values, "Consumed emissions");
        dataSet.setDrawIcons(false);
        dataSet.setColor(getResources().getColor(R.color.consumedEmissions, getTheme()));
        dataSet.setCircleColor(getResources().getColor(R.color.consumedEmissions, getTheme()));
        dataSet.setLineWidth(3f);
        dataSet.setDrawCircleHole(false);

        ArrayList<ILineDataSet> dataSets = new ArrayList<>();
        dataSets.add(dataSet);
        mGraphChart.setData(new LineData(dataSets));
    }
}