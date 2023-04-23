package com.roopeh.electricemissions;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class EmissionEntry {
    private float mValue = 0.0f;
    private long mUnixTime = 0;

    public EmissionEntry(RawEmissionEntry rawData) {
        setValue(rawData.getValue());

        // Convert date string to unix time
        final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ", Locale.getDefault());
        final ZonedDateTime date = ZonedDateTime.parse(rawData.getStartTime(), formatter);
        setUnixTime(date.toInstant().getEpochSecond());
    }

    public void setValue(float val) { mValue = val; }
    public void setUnixTime(long time) { mUnixTime = time; }

    final public float getValue() { return mValue; }
    // Returns seconds since epoch time
    final public long getUnixTime() { return mUnixTime; }
}
