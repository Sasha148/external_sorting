const nReadlines = require('n-readlines');
const fs = require('fs');
const path = require("path");


const input_file_path = path.resolve(process.argv[2]);
const temp_dir_path = process.argv[3];
const chunkSize = 40000 //Количество строк записываемых в файл
const broadbandLines = new nReadlines(input_file_path);

let line;
let lineNumber = 1;
let file_index = 0;

//Удаление выходного файла если он существует
try {
    fs.unlinkSync(temp_dir_path + `/out.txt`);
} catch (error) { }


//Время начала выполнения программы
const start = new Date().getTime();

function union_arrays(x, y) {
    var obj = {};
    for (var i = x.length - 1; i >= 0; --i)
        obj[x[i]] = x[i];
    for (var i = y.length - 1; i >= 0; --i)
        obj[y[i]] = y[i];
    var res = []
    for (var k in obj) {
        if (obj.hasOwnProperty(k))
            res.push(obj[k]);
    }
    return res;
}

let chunkData = ""

//Считывание входного файла и запись в более мелкие файлы
while (true) {
    if (line = broadbandLines.next()) {
        chunkData += line.toString('utf-8') + "\n"
        if (lineNumber % chunkSize == 0 || line == false) {
            fs.writeFileSync(temp_dir_path + `/chunk${file_index}.txt`, chunkData, { flag: 'a' });
            chunkData = ""
            file_index++
        }
        lineNumber++;
    } else {
        if (chunkData.length > 0) {
            fs.writeFileSync(temp_dir_path + `/chunk${file_index}.txt`, chunkData, { flag: 'a' });
            file_index++
        }
        break;
    }
}

const wr = new Date().getTime();
console.log(`Chunk file create time: ${(wr - start) / 1000}s`);

//Считывание двух малых файлов, соритовка и запись первого остортированного фрагмента в выходной файл
for (let x = 0; x < file_index; x++) {
    var array1 = fs.readFileSync(temp_dir_path + `/chunk${x}.txt`).toString().split("\n").filter(element => {
        return element !== '';
    });
    chunkData = ""
    for (let y = x + 1; y < file_index; y++) {
        var array2 = fs.readFileSync(temp_dir_path + `/chunk${y}.txt`).toString().split("\n").filter(element => {
            return element !== '';
        });
        var array3 = union_arrays(array1, array2).sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        })
        let i = 0
        array1 = array3.slice(i, i + chunkSize);
        i += chunkSize
        array2 = array3.slice(i, i + chunkSize);
        array3 = []
        try {
            fs.unlinkSync(temp_dir_path + `/chunk${y}.txt`);
        } catch (error) { }
        chunkData = array2.join('\n');
        fs.writeFileSync(temp_dir_path + `/chunk${y}.txt`, chunkData, { flag: 'a' });
        array2 = []
        chunkData = ""
    }
    try {
        fs.unlinkSync(temp_dir_path + `/chunk${x}.txt`);
    } catch (error) { }
    chunkData = array1.join('\n');
    fs.writeFileSync(temp_dir_path + `/out.txt`, chunkData, { flag: 'a' });
}

//Вывод времени работы программы и используемой памяти
const sort = new Date().getTime();
console.log(`Sorting time: ${(sort - wr) / 1000}s`);
const end = new Date().getTime();
console.log(`Working time: ${(end - start) / 1000}s`);
const used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);