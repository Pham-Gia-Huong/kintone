(function() {
  kintone.events.on("app.record.index.show", function(event) {
    let createLoad = function() {
      let elmBody = document.getElementsByClassName("body-top");
      elmBody = elmBody[0];
      let layout = document.createElement("div");
      layout.innerHTML = "Loading.....";
      layout.style.fontSize = "18px";
      layout.id = "absolute";
      layout.style.position = "fixed";
      layout.style.top = 0;
      layout.style.left = 0;
      layout.style.right = 0;
      layout.style.bottom = 0;
      layout.style.display = "flex";
      layout.style.justifyContent = "center";
      layout.style.alignItems = "center";
      let getLayout = document.getElementById("absolute");
      if (!getLayout) {
        elmBody.appendChild(layout);
      }
    };
    function CallApi(data) {
      kintone
        .api("/k/v1/records/status", "PUT", data)
        .then(function(res) {
          return res;
        })
        .catch(function(err) {
          console.log(err);
        });
    }
    let spaceHeader = kintone.app.getHeaderMenuSpaceElement();
    let select = document.createElement("select");
    let select2 = document.createElement("select");
    let arr = [{ id: 0, value: "Not started" }, { id: 1, value: "Progress" }, { id: 1, value: "Test" }];
    let arr2 = [{ id: 0, value: "Progress" }, { id: 1, value: "Test" }, { id: 2, value: "Completed" }];
    let btn = document.createElement("button");
    let valueCheck = arr[0].value;
    let valueCheck2 = arr2[0].value;
    btn.innerHTML = "Submit";
    let userLogin = kintone.getLoginUser();
    function DropdownComponent(arr, elm) {
      let option = "";
      for (let i = 0; i < arr.length; i++) {
        option = option + "<option value='" + arr[i].value + "'>" + arr[i].value + "</option>";
      }
      elm.innerHTML = option;
      elm.style.marginRight = "10px";
      return elm;
    }
    select.addEventListener("click", function() {
      valueCheck = select.value;
    });
    select2.addEventListener("click", function() {
      valueCheck2 = select2.value;
    });
    btn.addEventListener("click", function() {
      kintone.api(
        kintone.api.url("/k/v1/records", true) + `?app=${kintone.app.getId()}`,
        "GET",
        {},
        function(resp) {
          let arrRecord = resp.records;
          let newListRecord = [];

          arrRecord.forEach(async element => {
            let statusAssign = false;
            let mathUser = "";
            if (element.Assignee.value.length > 0) {
              mathUser = element.Assignee.value.filter(data => data.code === userLogin.email)[0];
            }
            if ((valueCheck === element.Status.value && element.Assignee.value.length === 0) || (valueCheck === element.Status.value && mathUser)) {
              let obj = {};
              var body = {
                app: kintone.app.getId(),
              };
              let callRecord = false;

              createLoad();
              if (
                (valueCheck2 === "Progress" && valueCheck !== "Progress" && valueCheck != "Test") ||
                (valueCheck === "Not started" && valueCheck2 === "Test") ||
                (valueCheck === "Not started" && valueCheck2 === "Completed")
              ) {
                obj = {
                  id: element.$id.value,
                  action: "Progress",
                };

                newListRecord.push(obj);
                body.records = [...newListRecord];
                newListRecord = [];
                callRecord = true;
                await CallApi(body);
              }
              setTimeout(() => {
                if (
                  (valueCheck2 === "Test" && valueCheck !== "Test") ||
                  (valueCheck === "Not started" && valueCheck2 === "Completed") ||
                  (valueCheck === "Progress" && valueCheck2 === "Completed")
                ) {
                  obj = {
                    id: element.$id.value,
                    action: "Test",
                  };
                  newListRecord.push(obj);
                  body.records = [...newListRecord];
                  newListRecord = [];
                  callRecord = true;

                  CallApi(body);
                }
              }, 1000);
              setTimeout(() => {
                if (valueCheck !== "Completed" && valueCheck2 === "Completed") {
                  obj = {
                    id: element.$id.value,
                    action: "Completed",
                  };
                  newListRecord.push(obj);
                  body.records = [...newListRecord];
                  newListRecord = [];
                  callRecord = true;

                  CallApi(body);
                }
              }, 2000);
              setTimeout(() => {
                if (callRecord) {
                  window.location.reload();
                } else {
                  let layout = document.getElementById("absolute");
                  console.log(layout);

                  layout ? layout.parentNode.removeChild(layout) : "";
                }
              }, 3000);
            }
          });
        },
        function(error) {
          // error
          console.log(error);
        },
      );
    });
    select = DropdownComponent(arr, select);
    select2 = DropdownComponent(arr2, select2);
    spaceHeader.appendChild(select);
    spaceHeader.appendChild(select2);
    spaceHeader.appendChild(btn);
  });
})();
