package com.roopeh.electricemissions;

public class RawEmissionEntry {
    private float value = 0.0f;
    private String start_time = "";
    private String end_time = "";

    public void setValue(float val) { value = val; }
    public void setStartTime(String time) { start_time = time; }
    public void setEndTime(String time) { end_time = time; }

    final public float getValue() { return value; }
    final public String getStartTime() { return start_time; }
    final public String getEndTIme() { return end_time; }
}
