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
                renderData(filterProjects(fileData));
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
            // dateTo = dateTo.substring(0, dateTo.length - 1)
            let currentProject = projects.find(el => el.id == projectID)

            if (dateTo == 'NULL' || dateTo == 'NULL\r') {
                dateTo = new Date().toISOString().slice(0, 10);
            }

            if (currentProject == undefined) {
                projects.push(({ id: projectID, data: [empID, dateFrom, dateTo], workedDays: 0 }))
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

    function findCommonDays(data) {
        for (let project of data) {
            let [empl1ID, startOne, endOne, empl2ID, startTwo, endTwo] = project.data;
            let diff = 0;
            startOne = Date.parse(startOne) / 1000;
            endOne = Date.parse(endOne) / 1000;
            startTwo = Date.parse(startTwo) / 1000;
            endTwo = Date.parse(endTwo) / 1000;

            if ((startTwo >= startOne && startTwo <= endOne)) {
                if (endTwo > endOne) {
                    diff = endOne - startTwo
                } else {
                    diff = endTwo - startTwo
                }
            } else if (startOne >= startTwo && startOne <= endTwo) {
                if (endOne > endTwo) {
                    diff = endTwo - endTwo;
                } else {
                    diff = endOne - startOne;
                }
            }

            diff = (Math.ceil(diff / 86400));
            project.workedDays = diff;
        }
        return data;
    }

    function filterProjects(fileData) {
        let data = findCommonDays(formatData(fileData))
        let arrMostCommonDaysProjects = [];
        let arrOfData = Object.values(data)
            .sort((a, b) => (b.workedDays - a.workedDays))
            
        for (let i in arrOfData) {
            if (Number(i) + 1 < arrOfData.length &&
                arrOfData[i].workedDays >= arrOfData[Number(i) + 1].workedDays) {
                    arrMostCommonDaysProjects.push(arrOfData[i])
            }
        }

        return arrMostCommonDaysProjects;
    }

    function renderData(data) {
        console.log(data)
        // for (let i = 0; i < data.length; i++) {
        //     let row = table.insertRow(-1);
        //     let cells = data[i].split(",");
        //     for (let j = 0; j < cells.length; j++) {
        //         let cell = row.insertCell(-1);
        //         cell.innerHTML = cells[j];
        //     }
        // }
        output.innerHTML = "";
        output.appendChild(table);
    }
}