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
                renderData(bestPairFilter(fileData));
            }
            reader.readAsText(uploadedFile.files[0]);
        } else {
            error.innerHTML = "Please upload a valid CSV file."
            output.appendChild(error);
        }
    }

    function formatData(data) {
        data.shift();
        let dataArr = [];
        data.forEach(row => {
            let [empID, projectID, dateFrom, dateTo] = row.split(", ").map(x => x.toString());
            dataArr.push([empID, projectID, dateFrom, dateTo])
        })

        const projects = dataArr.reduce((proj, [empID, projectID, dateFrom, dateTo]) => {
            if (dateTo == 'NULL' || dateTo == 'NULL\r' || dateTo == 'null' || dateTo == 'null\r') {
                dateTo = new Date().toISOString().slice(0, 10);
            }
            let startDate = Date.parse(dateFrom) / 1000;
            let endDate = Date.parse(dateTo) / 1000;
            proj[projectID] = proj[projectID] ?? [];
            proj[projectID].push({ empID, startDate, endDate });
            return proj;
        }, {})

        return projects;
    }

    function combineEmployees(data) {
        let obj = {}
        for (let project in data)
            for (let i = 0; i < data[project].length - 1; i++)
                for (let j = i + 1; j < data[project].length; j++) {
                    let firstEmp = data[project][i];
                    let secondEmp = data[project][j];
                    let startOne = Number(firstEmp.startDate)
                    let endOne = Number(firstEmp.endDate);
                    let startTwo = Number(secondEmp.startDate);
                    let endTwo = Number(secondEmp.endDate);
                    let diff = 0;

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
                    let days = Math.ceil(diff / 86400)
                    let pairID = `${firstEmp.empID}-${secondEmp.empID}`;

                    obj[pairID] = obj[pairID] ?? { firstEmp: firstEmp.empID, secondEmp: secondEmp.empID, workedDays: 0, details: [] }
                    obj[pairID].details.push({ project: Number(project), days })
                    obj[pairID].workedDays += days
                }
        return obj;
    }

    function bestPairFilter(fileData) {
        let data = combineEmployees(formatData(fileData));
        let filtered = [];
        Object.values(data)
            .sort((a, b) => b.workedDays - a.workedDays)
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
                let { firstEmp, secondEmp, workedDays, details } = projects[i]
                let cells = [];
                Object.values(details)
                    .forEach(({ project, days }) => {
                        cells.push(firstEmp, secondEmp, project, days)
                    })
               
                let matrix = arrToMatrix(cells, 4)
                for (let j = 0; j < matrix.length; j++) {
                    let innerRow = table.insertRow(-1);
                    for (let k = 0; k < matrix[j].length; k++) {
                        let cell = innerRow.insertCell(-1);
                        cell.innerHTML = matrix[j][k];
                    }
                }
            }
            
            output.innerHTML = "";
            output.appendChild(table);
        } else {
            error.innerHTML = "There isn't any pair of employees who have worked together"
            output.appendChild(error);
        }
    }

    function arrToMatrix(list, elementsPerSubArray) {
        let matrix = [], i, k;
        for (i = 0, k = -1; i < list.length; i++) {
            if (i % elementsPerSubArray === 0) {
                k++;
                matrix[k] = [];
            }
            matrix[k].push(list[i]);
        }
        return matrix;
    }
}