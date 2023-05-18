package com.roopeh.electricemissions;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.Locale;
import java.util.TimeZone;

// Singleton class to store some variables and data
public class LocalStore {
    private static volatile LocalStore mInstance = null;

    private LocalStore() {}
    public static LocalStore getInstance() {
        if (mInstance == null) {
            synchronized (LocalStore.class) {
                if (mInstance == null) {
                    mInstance = new LocalStore();
                }
            }
        }

        return mInstance;
    }

    private ZonedDateTime mStartDate = null;
    private ZonedDateTime mEndDate = null;

    private Locale mSelectedLanguage = Locale.ENGLISH;

    final public ZonedDateTime getStartDate() {
        // Make sure date is initialized
        if (mStartDate == null) {
            mStartDate = LocalDate.now().atTime(0, 0, 0).atZone(TimeZone.getDefault().toZoneId());
        }
        return mStartDate;
    }
    public void setStartDate(ZonedDateTime time) { mStartDate = time; }

    final public ZonedDateTime getEndDate() {
        // Make sure date is initialized
        if (mEndDate == null) {
            mEndDate = LocalDate.now().atTime(23, 59, 59).atZone(TimeZone.getDefault().toZoneId());
        }
        return mEndDate;
    }
    public void setEndDate(ZonedDateTime time) { mEndDate = time; }

    final public Locale getSelectedLanguage() { return mSelectedLanguage; }
    public void setSelectedLanguage(Locale loc) { mSelectedLanguage = loc; }
}
