class GUI {
    constructor() {
        this.svg = null;
        this.name = null;
    }
    getWiki(path) {
        let id = path.getAttribute("id");
        this.name = path.getAttribute("aria-labelledby");
        if (id === null) {
            id = path.parentNode.getAttribute("id");
            this.name = path.parentNode.getAttribute("aria-labelledby");
        }
        return id;
    }
    getName() {
        let nome = this.svg.getElementById(this.name);
        return nome.textContent;
    }
    getValue(array) {
        let val = null;
        for (let i = 1; i < array.length; i++) {
            let x = array[i];
            let y = x.replace(/(,|\\|[a-zA-Z])/g, '');
            let z = parseFloat(y);
            if (!isNaN(z)) {
                val = z;
                break;
            }
        }
        return val;
    }
    process(json) {
        let out = document.getElementById("out");
        let text = json.getElementsByTagName("rev")[0].textContent;
        let data = text.split('|');
        let area = null, populacao = null;
        for (let i = 0; i < data.length; i++) {
            let value = data[i];
            let arr = value.split(/(\s|=|<)/);
            arr.forEach(elem => {
                if (elem === "area_km2") {
                    area = this.getValue(arr);
                } else if (elem === "population_census" || elem === "population_estimate") {
                    let val = this.getValue(arr);
                    if (populacao === null && val !== null) {
                        populacao = val;
                    }
                }
            });
        }
        let formatter = new Intl.NumberFormat('pt-BR');
        let nome = this.getName();
        let str = `<table><caption>${nome}</caption>`;
        str += `<tr><th>Área</th><td>${formatter.format(area)} km²</td></tr>`;
        str += `<tr><th>População</th><td>${formatter.format(populacao)}</td></tr>`;
        str += "</table>";
        out.innerHTML = str;
    }
    async over(evt) {
        let path = evt.currentTarget;
        let nome = this.getWiki(path);
        let response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${nome}&prop=revisions&rvprop=content&format=xml&origin=*`);
        if (response.ok) {
            let text = await response.text();
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(text, "application/xml");
            this.process(xmlDoc);
        }
    }
    wiki(evt) {
        let path = evt.currentTarget;
        let page = this.getWiki(path);
        window.location = `http://en.wikipedia.org/wiki/${page}`;
    }
    registerEvents() {
        let paths = this.svg.querySelectorAll("path");
        paths.forEach(path => {
            path.onmouseenter = this.over.bind(this);
            path.onclick = this.wiki.bind(this);
        });
    }
    init() {
        let map = document.getElementById("map");
        this.svg = map.contentDocument;
        this.registerEvents();
    }
}
onload = () => {
    let gui = new GUI();
    gui.init();
};