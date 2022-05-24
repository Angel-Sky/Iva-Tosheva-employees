function solve() {
    let uploadedFile = document.querySelector("#employeesUpload");
    let fileData;
    let table = document.createElement("table");
    let output = document.getElementById("result");
    document.querySelector("#btn-submit-employees").addEventListener("click", addEvent);

    function addEvent(e) {
        e.preventDefault();
        let regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
        if (regex.test(uploadedFile.value.toLowerCase())) {
            let reader = new FileReader();
            reader.onload = function (e) {
                fileData = e.target.result.split("\n");
                console.log(fileData)
                renderData(fileData);
            }
            reader.readAsText(uploadedFile.files[0]);
        } else {
            alert("Please upload a valid CSV file.");
        }
    }

    function renderData(data) {
        for (let i = 0; i < data.length; i++) {
            let row = table.insertRow(-1);
            let cells = data[i].split(",");
            console.log(cells)
            for (let j = 0; j < cells.length; j++) {
                let cell = row.insertCell(-1);
                cell.innerHTML = cells[j];
            }
        }
        output.innerHTML = "";
        output.appendChild(table);
    }
}