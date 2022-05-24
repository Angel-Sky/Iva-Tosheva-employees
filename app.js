function solve() {
    let uploadedFile = document.querySelector("#employeesUpload");
    let fileData;
    let table = document.createElement("table");
    let output = document.getElementById("result");
    let error = document.createElement("div");
    error.setAttribute("id", "error");
    document.querySelector("#btn-submit-employees").addEventListener("click", addEvent);

    function addEvent(e) {
        e.preventDefault();
        let regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
        if (regex.test(uploadedFile.value.toLowerCase())) {
            table.innerHTML = "";
            let reader = new FileReader();
            reader.onload = function (e) {
                fileData = e.target.result.split("\n");
                renderData(filterProjects(fileData));
            }
            reader.readAsText(uploadedFile.files[0]);
        } else {
            error.innerHTML = "Please upload a valid CSV file."
            output.appendChild(error);
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
        let filtered = [];
        Object.values(data)
            .sort((a, b) => (b.workedDays - a.workedDays))
            .reduce((prev, current) => {
                if (prev.workedDays > current.workedDays) {
                    return prev;
                } else {
                    filtered.push(current);
                    return current
                }
            }, [filtered])

        return filtered;
    }

    function renderData(projects) {
        if (projects.length > 0) {
            let headers = ['Employee ID #1', 'Employee ID #2', 'Project ID', 'Days worked']
            let row = table.insertRow(-1);

            for (let k = 0; k < headers.length; k++) {
                let cell = row.insertCell(-1);
                cell.innerHTML = headers[k];
            }

            for (let i = 0; i < projects.length; i++) {
                let innerRow = table.insertRow(-1);
                let cells = [projects[i].id, projects[i].data[0], projects[i].data[3], projects[i].workedDays];

                for (let j = 0; j < cells.length; j++) {
                    let cell = innerRow.insertCell(-1);
                    cell.innerHTML = cells[j];
                }

            }
            output.innerHTML = "";
            output.appendChild(table);
        } else {
            error.innerHTML = "There isn't any pair of employees who have worked together"
            output.appendChild(error);
        }
    }
}