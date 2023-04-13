package com.roopeh.electricemissions;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class EmissionEntry {
    private float mValue = 0.0f;
    private long mUnixTime = 0;

    public EmissionEntry(RawEmissionEntry rawData) {
        setValue(rawData.getValue());

        // Convert date string to unix time
        try {
            final Date date = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ", Locale.ENGLISH)
                    .parse(rawData.getStartTime());
            assert date != null;
            setUnixTime(date.getTime() / 1000L);
        } catch (ParseException err) {
            err.printStackTrace();
        }
    }

    public void setValue(float val) { mValue = val; }
    public void setUnixTime(long time) { mUnixTime = time; }

    final public float getValue() { return mValue; }
    // Returns seconds since epoch time
    final public long getUnixTime() { return mUnixTime; }
}
