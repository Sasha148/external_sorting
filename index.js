const nReadlines = require('n-readlines');
const fs = require('fs');
const path = require("path");

const input_file_path = path.resolve(process.argv[2]);
const temp_dir_path = process.argv[3];
const chunkSize = 20000 //Количество строк записываемых в файл
console.log(input_file_path, temp_dir_path);
const broadbandLines = new nReadlines(input_file_path);

let line;
let lineNumber = 1;
let arr = [];
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

function write_to_file(name, array, flag) {
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        fs.writeFileSync(temp_dir_path + `${name}.txt`, element + '\n', { flag: flag });
    }
}

//Считывание входного файла и запись в более мелкие файлы
while (true) {
    if (line = broadbandLines.next()) {
        arr.push(line.toString('ascii'))
        if (lineNumber % chunkSize == 0 || line == false) {
            arr.sort();
            write_to_file('/res' + file_index, arr, 'a')
            arr = []
            file_index++
        }
        lineNumber++;
    } else {
        if (arr.length > 0) {
            arr.sort();
            write_to_file('/res' + file_index, arr, 'a')
            file_index++
        }
        break;
    }
}

//Считывание двух малых файлов, соритовка и запись первого остортированного фрагмента в выходной файл
for (let x = 0; x < file_index; x++) {
    var array1 = fs.readFileSync(temp_dir_path + `/res${x}.txt`).toString().split("\n").filter(element => {
        return element !== '';
    });
    for (let y = x + 1; y < file_index; y++) {
        var array2 = fs.readFileSync(temp_dir_path + `/res${y}.txt`).toString().split("\n").filter(element => {
            return element !== '';
        });
        var array3 = union_arrays(array1, array2).sort()
        let i = 0
        // let chunk = array3.slice(i, i + chunkSize);
        // array1 = chunk
        array1 = array3.slice(i, i + chunkSize);
        i += chunkSize
        array2 = array3.slice(i, i + chunkSize);
        array3 = []
        try {
            fs.unlinkSync(temp_dir_path + `/res${y}.txt`);
        } catch (error) { }
        write_to_file('/res' + y, array2, 'a')
        array2 = []
    }
    try {
        fs.unlinkSync(temp_dir_path + `/res${x}.txt`);
    } catch (error) { }
    write_to_file('/out', array1, 'a')
}

//Вывод времени работы программы и используемой памяти
const end = new Date().getTime();
console.log(`Working time: ${(end - start)/1000}s`);
const used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);