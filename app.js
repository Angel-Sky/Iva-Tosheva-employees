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
                // console.log(fileData)
                findTheLongestPeriod(formatData(fileData));
                renderData(fileData);
            }
            reader.readAsText(uploadedFile.files[0]);
        } else {
            alert("Please upload a valid CSV file.");
        }
    }

    function formatData(data) {
        let projects = [];
        data.shift();
        data.forEach(row => {
            let [empID, projectID, dateFrom, dateTo] = row.split(", ");
            dateTo = dateTo.substring(0, dateTo.length - 1)
            let currentProject = projects.find(el => el.id == projectID)

            if (dateTo == 'NULL') {
                dateTo = new Date().toISOString().slice(0, 10);
            }

            if (currentProject == undefined) {
                projects.push(({ id: projectID, data: [empID, dateFrom, dateTo] }))
            } else {
                currentProject.data.push(empID, dateFrom, dateTo)
            }
        })
        for (let project of projects) {
            if (project.data.length < 6) {
                let unnecessaryProjectIndex = projects.indexOf(project);
                projects.splice(unnecessaryProjectIndex, 1)
            }
        }
        return projects;
    }

    function findTheLongestPeriod(data) {
        for (let project of data) {
            let [empl1ID, empl1StartDate, empl1EndDate, empl2ID, emlp2StartDate, empl2EndDate] = project.data;
            console.log(project)
        }
    }

    function renderData(data) {
        for (let i = 0; i < data.length; i++) {
            let row = table.insertRow(-1);
            let cells = data[i].split(",");
            for (let j = 0; j < cells.length; j++) {
                let cell = row.insertCell(-1);
                cell.innerHTML = cells[j];
            }
        }
        output.innerHTML = "";
        output.appendChild(table);
    }
}