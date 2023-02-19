class CanvasData {
    classes = []

    add(data) {
        this.classes.push(data)
    }

    save(filename) {
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([JSON.stringify(this.classes)], {type: 'text/plain'}));
        a.download = `${filename}.txt`;
        a.click(); 
    }
}