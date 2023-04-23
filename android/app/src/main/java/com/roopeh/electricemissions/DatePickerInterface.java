package com.roopeh.electricemissions;

import java.time.ZonedDateTime;

public interface DatePickerInterface {
    void onDateChanged(ZonedDateTime dateTime, boolean isStartDate);
}
