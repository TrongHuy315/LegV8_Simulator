export function setTextById(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    }
    else {
        console.warn(`Not found element with id: "${id}"`);
    }
}
