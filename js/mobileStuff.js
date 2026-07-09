const keyboardInput = document.getElementById("keyboard-input");

let activeTextField = null;

export function focusTextField(textField) {
    activeTextField = textField;

    keyboardInput.value = textField.text;

    keyboardInput.focus();

    // optional: move cursor to end
    keyboardInput.setSelectionRange(
        keyboardInput.value.length,
        keyboardInput.value.length
    );
}

keyboardInput.addEventListener("input", () => {

    if (!activeTextField)
        return;

    activeTextField.text = keyboardInput.value;

});