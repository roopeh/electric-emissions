package com.roopeh.electricemissions;

import android.app.DatePickerDialog;
import android.app.Dialog;
import android.os.Bundle;
import android.widget.DatePicker;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.TimeZone;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;

public class DatePickerFragment extends DialogFragment
        implements DatePickerDialog.OnDateSetListener {

    final private boolean mIsStartDate;
    final private ZonedDateTime mDateTime;
    final private DatePickerInterface datePickerInterface;

    public DatePickerFragment(DatePickerInterface datePickerInterface, ZonedDateTime dateTime, boolean isStartDate) {
        this.datePickerInterface = datePickerInterface;
        this.mDateTime = dateTime;
        this.mIsStartDate = isStartDate;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        final int year = mDateTime.getYear();
        final int month = mDateTime.getMonth().getValue() - 1;
        final int day = mDateTime.getDayOfMonth();
        return new DatePickerDialog(requireContext(), this, year, month, day);
    }

    @Override
    public void onDateSet(DatePicker view, int year, int month, int dayOfMonth) {
        // Time will be set correctly in interface method
        final ZonedDateTime dateTime = LocalDate.now()
                        .withYear(year).withMonth(month + 1).withDayOfMonth(dayOfMonth)
                        .atStartOfDay()
                        .atZone(TimeZone.getDefault().toZoneId());
        datePickerInterface.onDateChanged(dateTime, mIsStartDate);
    }
}
