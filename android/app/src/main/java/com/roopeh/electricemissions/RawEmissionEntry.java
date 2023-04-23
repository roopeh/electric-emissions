package com.roopeh.electricemissions;

public class RawEmissionEntry {
    private float value = 0.0f;
    private int variable_id = 0;
    private String start_time = "";
    private String end_time = "";

    final public float getValue() { return value; }
    final public int getVariableId() { return variable_id; }
    final public String getStartTime() { return start_time; }
    final public String getEndTIme() { return end_time; }
}
