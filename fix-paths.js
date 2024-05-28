const fs = require('fs');
const path = require('path');

function updatePaths(dirPath) {
    fs.readdirSync(dirPath).forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            updatePaths(filePath);
        } else {
            let content = fs.readFileSync(filePath, 'utf8');
            // content = content.replace(/src="\//g, 'src="./').replace(/href="\//g, 'href="./');
            content = content.replace('/_next', './_next')
            content = content.replace('/home', './home')
            content = content.replace('/images', './images')
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated paths in: ${filePath}`);
        }
    });
}

updatePaths('./out');
