package com.roopeh.electricemissions;

import com.github.mikephil.charting.formatter.IndexAxisValueFormatter;

import java.text.SimpleDateFormat;
import java.util.Locale;

public class ChartXAxisDateConverter extends IndexAxisValueFormatter {
    @Override
    public String getFormattedValue(float value) {
        final SimpleDateFormat dateFormatter = new SimpleDateFormat("dd MMM", Locale.getDefault());
        return dateFormatter.format(((long)value) * 1000);
    }
}
