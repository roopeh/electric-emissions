package com.roopeh.electricemissions;

import com.github.mikephil.charting.formatter.IndexAxisValueFormatter;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.TimeZone;

public class ChartXAxisDateConverter extends IndexAxisValueFormatter {
    private ZonedDateTime previousValue = null;

    @Override
    public String getFormattedValue(float value) {
        // Convert unix time to local timezone
        final ZonedDateTime dateTime = Instant.ofEpochSecond((long)value).atZone(TimeZone.getDefault().toZoneId());

        final String datePattern;
        if (previousValue == null || previousValue.getDayOfMonth() != dateTime.getDayOfMonth()) {
            datePattern = "dd MMM";
        } else {
            datePattern = "HH:mm";
        }

        previousValue = dateTime;

        final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern(datePattern, Locale.getDefault());
        return dateTime.format(dateFormatter);
    }
}
