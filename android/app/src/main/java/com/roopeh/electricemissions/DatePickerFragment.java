package com.roopeh.electricemissions;

import android.app.DatePickerDialog;
import android.app.Dialog;
import android.os.Bundle;
import android.widget.DatePicker;

import java.util.Calendar;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;

public class DatePickerFragment extends DialogFragment
        implements DatePickerDialog.OnDateSetListener {

    final private boolean mIsStartDate;
    final private Calendar mCalendar;
    final private DatePickerInterface datePickerInterface;

    public DatePickerFragment(DatePickerInterface datePickerInterface, Calendar calendar, boolean isStartDate) {
        this.datePickerInterface = datePickerInterface;
        this.mCalendar = calendar;
        this.mIsStartDate = isStartDate;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        final int year = mCalendar.get(Calendar.YEAR);
        final int month = mCalendar.get(Calendar.MONTH);
        final int day = mCalendar.get(Calendar.DAY_OF_MONTH);
        return new DatePickerDialog(requireContext(), this, year, month, day);
    }

    @Override
    public void onDateSet(DatePicker view, int year, int month, int dayOfMonth) {
        // Create new instance of Calendar so start and end dates won't get messed up
        final Calendar calendar = Calendar.getInstance();
        calendar.set(year, month, dayOfMonth);
        datePickerInterface.onDateChanged(calendar, mIsStartDate);
    }
}
