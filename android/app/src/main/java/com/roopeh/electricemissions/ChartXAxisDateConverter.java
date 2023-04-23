package com.roopeh.electricemissions;

import com.github.mikephil.charting.formatter.IndexAxisValueFormatter;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.TimeZone;

public class ChartXAxisDateConverter extends IndexAxisValueFormatter {
    @Override
    public String getFormattedValue(float value) {
        // Convert unix time to local timezone
        final ZonedDateTime dateTime = Instant.ofEpochSecond((long)value).atZone(TimeZone.getDefault().toZoneId());
        // final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM", Locale.getDefault());
        final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("HH mm", Locale.getDefault());
        return dateTime.format(dateFormatter);
    }
}
