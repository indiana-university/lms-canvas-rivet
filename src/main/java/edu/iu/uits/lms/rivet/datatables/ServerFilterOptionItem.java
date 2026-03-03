package edu.iu.uits.lms.rivet.datatables;

public class ServerFilterOptionItem {

    private String optionValue;
    private String displayText;

    public ServerFilterOptionItem(String optionValue) {
        this.optionValue = optionValue;
        this.displayText = optionValue;
    }

    public ServerFilterOptionItem(String optionValue, String displayText) {
        this.optionValue = optionValue;
        this.displayText = displayText;
    }

    public String getOptionValue() {
        return optionValue;
    }

    public void setOptionValue(String optionValue) {
        this.optionValue = optionValue;
    }

    public String getDisplayText() {
        return displayText;
    }

    public void setDisplayText(String displayText) {
        this.displayText = displayText;
    }
}
