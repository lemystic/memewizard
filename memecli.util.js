const axios = require('axios')
const { closestMatch } = require('closest-match')
const fs = require('fs')

const rand = (minimum, maximum) => { return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum; }
const mean = (arr) => { return arr.reduce((p,a) => p+a, 0)/arr.length }

async function fetch_meme(inp) {
    var res = await axios.get('http://memeengine.servehttp.com:80/api/v1/memes/popular/stats')
    var d = res.data['response']
    var names = d.map(c => { return c['name'] })
    var object = d.reduce(
        (obj, item) => Object.assign(obj, { [item['name']]: [...item['trend'],...item['predict']] } ), {});
    var close = closestMatch(inp, names)

    var y = object[close]
    var doc = await axios.get('https://raw.githubusercontent.com/ajskateboarder/stuff/main/meme.js/line.html')

    fs.promises.writeFile(`${close}.html`, doc.data.replace('/*name*/', close).replace('/*data*/', y.toString()))
}

function fetch_popularity() {
    axios.get('http://memeengine.servehttp.com:80/api/v1/memes/popular/stats')
    .then(res => {
        var d = res.data['response']
        var k = {}
        d.forEach(v => { k[v['name']] = mean(v['trend']) })
        
        axios.get('https://raw.githubusercontent.com/ajskateboarder/stuff/main/meme.js/pie.html')
        .then(doc => {
            var colors = Array.from({ length: Object.keys(k).length }, (_, k) => `'rgb(${rand(200,255)},${rand(200,255)},${rand(200,255)})'`);
            fs.writeFileSync('popularity.html', doc.data.replace('{/*data*/}', JSON.stringify(k)).replace('/*colors*/', colors.toString()))
        })
    })
}

exports.fetch_meme = fetch_meme
exports.fetch_popularity = fetch_popularity