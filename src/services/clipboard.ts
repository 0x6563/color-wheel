export function CopyToClipboard(input: string): Promise<boolean> {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(input).then(() => true).catch(() => false);
    }
    return Promise.resolve(DOMToClipboard(input));
}

function DOMToClipboard(input: string) {
    const textArea = document.createElement("textarea");
    document.body.appendChild(textArea);
    textArea.value = input;
    textArea.focus();
    textArea.select();
    let success = false;
    try {
        success = document.execCommand("copy");
    } catch (err) {
    }

    document.body.removeChild(textArea);
    return success;
}