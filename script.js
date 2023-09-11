// ==UserScript==
// @name         Enhanced-Course-Selection-Assistant-for-Tsinghua-University清华大学选课辅助
// @version      0.1
// @author       Xiang Wentao
// @match        http://zhjwxk.cic.tsinghua.edu.cn/*
// @match        https://webvpn.tsinghua.edu.cn/http/*
// @icon         https://www.tsinghua.edu.cn/favicon.ico
// ==/UserScript==

function run_bijiaorenshu() {
    let page_title_tag = document.querySelector("body > div.waiKuang > div.concent.clearfix > div > div > p");
    if(!page_title_tag) return;
    let page_title = page_title_tag.textContent;
    if(page_title_tag && page_title == '填报志愿情况查询'){
        let iframe_top = document.getElementsByName("top")[0];
        let a = document.querySelector("body > div.waiKuang > div.concent.clearfix > div > div > div > p:nth-child(2)").getElementsByTagName("iframe")[0];
        var iwindow = a.contentWindow;
        var idoc = iwindow.document
        let tbody_tag = idoc.querySelector("body > form > div > div > div > div > div.tab > table > tbody");
        let tr_arr = tbody_tag.querySelectorAll("tr");
        for(let i = 0; i < tr_arr.length; i++){
            let t_tr = tr_arr[i];
            let td_arr = t_tr.querySelectorAll("td");
            let total = td_arr[4].textContent;
            let current = td_arr[5].textContent;
            total = parseInt(total);
            current = parseInt(current);
            if(total <= current){
                let s = td_arr[4].getAttribute("style");
                td_arr[4].getAttribute("style");
                td_arr[4].setAttribute("style", s+"color:red;");
                s = td_arr[5].getAttribute("style");
                td_arr[5].getAttribute("style");
                td_arr[5].setAttribute("style", s+"color:red;");
            }
        }
    }
}
function run_bijiaoshijian(){
    function strip(s){
        return s.replaceAll("\t", "").replaceAll(" ", "").replaceAll("\n", "");
    }

    function formatClassDate(t1){

        let ret = null;
        let date1 = t1.substr(0, t1.indexOf("("));
        ret = date1;


        return ret;
    }
    function transformRangeToWeekArray(range_string){
        let t_sp = range_string.split('-');
        let ret = new Array();
        for(let i = parseInt(t_sp[0]); i <= parseInt(t_sp[1]); i++){
            ret.push(i);
        }
        return ret;
    }
    function formatSuffix(suff){
        let ret = null;
        let transformDict = {
            "一":1,
            "二":2,
            "三":3,
            "四":4,
            "五":5,
            "六":6,
            "七":7,
            "八":8,
            "九":9,
            "十":10,
            "十一":11,
            "十二":12,
        };
        suff = suff.substr(1, suff.indexOf(")")-1);
        if(suff.indexOf("全周")!=-1){
            ret = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
        }else{
            let ind = suff.indexOf("前");
            if(ind != -1){
                suff = suff.substr(ind+1, suff.indexOf("周")-1);
                suff = transformDict[suff];
                ret = new Array();
                for(let i = 1; i <= suff; i++){
                    ret.push(i);
                }
            }else{
                ind = suff.indexOf("后");
                if(ind != -1){
                    suff = suff.substr(ind+1, suff.indexOf("周")-1);
                    suff = transformDict[suff];
                    ret = new Array();
                    for(let i = 16; i > 16-suff; i--){
                        ret.splice(0, 0, i);
                    }
                }else{
                    ind = suff.indexOf(",");
                    if(ind != -1){
                        suff = suff.split(",");
                        let last_ele = suff[suff.length-1];
                        let ind_zhou = last_ele.indexOf("周");
                        suff[suff.length-1] = last_ele.substr(0, ind_zhou);
                        ret = new Array();
                        for(let i = 0; i < suff.length; i++){
                            if(suff[i].indexOf("-") != -1){
                                let t= transformRangeToWeekArray(suff[i]);
                                for(let iii = 0; iii < t.length; iii++){
                                    ret.push(t[iii]);
                                }
                            }else{
                                ret.push(parseInt(suff[i]));
                            }
                        }
                    }else{
                        ret = new Array();
                        suff = suff.substr(0, suff.indexOf("周"));
                        ret.splice(0, 0, transformRangeToWeekArray(suff));
                    }
                }
            }
        }
        return ret;
    }
    function splitByWantedComma(date_to_split){
        let flag = false;
        let numberOfComma = 0;
        let ret = [];
        let t = [-1];
        let globalN = 0;
        for(let i = 0; i < date_to_split.length; i++){
            if(date_to_split[i] == "("){
                if(!flag){
                    flag = true;
                }
            }else if(date_to_split[i] == ")"){
                if(flag){
                    flag = false;
                }
            }
            if(flag) continue;
            if(date_to_split[i] == ','){
                numberOfComma ++;
                t.push(i);
            }
        }
        for(let i = 0; i < t.length-1; i++){
            if(i == 0)
                ret.push(date_to_split.substr(t[i]+1, t[i+1]));
            else{
                ret.push(date_to_split.substr(t[i]+1, t[i+1]-t[i]-1));
            }
            if(i == t.length - 2) {
                ret.push(date_to_split.substr(t[i+1]+1));
            }
        }
        return ret;
    }

    function compareTwoSingleDate(date_to_choose, date_chosen){
        let prefix_date_to_choose = date_to_choose.substr(0, date_to_choose.indexOf("("));
        let day_to_choose = prefix_date_to_choose.split("-")[0];
        day_to_choose = parseInt(day_to_choose);
        let number_of_class_to_choose = date_to_choose.split("-")[1];
        number_of_class_to_choose = parseInt(number_of_class_to_choose);

        let prefix_date_chosen = date_chosen.substr(0, date_chosen.indexOf("("));
        let day_chosen = prefix_date_chosen.split("-")[0];
        day_chosen = parseInt(day_chosen);
        let number_of_class_chosen = prefix_date_chosen.split("-")[1];
        number_of_class_chosen = parseInt(number_of_class_chosen);
        if(day_chosen == day_to_choose && number_of_class_to_choose == number_of_class_chosen){
            let suffix_date_to_choose = date_to_choose.substr(prefix_date_to_choose.length);
            let suffix_date_chosen = date_chosen.substr(prefix_date_chosen.length);
            suffix_date_to_choose = formatSuffix(suffix_date_to_choose);
            suffix_date_chosen = formatSuffix(suffix_date_chosen);
            if(suffix_date_to_choose.length == 16 || suffix_date_chosen.length == 16){
                return false;
            }
            for(let i = 0; i < suffix_date_chosen.length; i++){
                for(let j = 0; j < suffix_date_to_choose.length; j++){
                    if(suffix_date_chosen[i] == suffix_date_to_choose[j]) return false;
                }
            }
        }
        return true;
    }

    function is2DateValid(date_to_choose, date_chosen){
        let splitByCommaToChoose = splitByWantedComma(date_to_choose);
        let splitByCommaChosen = splitByWantedComma(date_chosen);
        if(splitByCommaToChoose.length > 0 || splitByCommaChosen.length > 0){
            for(let i = 0; i < splitByCommaToChoose.length; i++){
                for(let j = 0; j < splitByCommaChosen.length; j++){
                    if(!compareTwoSingleDate(splitByCommaToChoose[i], splitByCommaChosen[j])){
                        return false;
                    }
                }
            }
            return true;
        }else{
            return compareTwoSingleDate(date_to_choose, date_chosen);
        }
    }

    function reset_table(table_tag){
        let tr_arr = table_tag.querySelectorAll("tr");
        for(let i = 0; i < tr_arr.length; i++){
            let tr = tr_arr[i];
            tr.style.color = "";
        }
    }
    function update_chosen_table(date_to_choose, bottom_table_tag){
        let tr_arr = bottom_table_tag.querySelectorAll("tr");
        let new_tr_arr = new Array();
        for(let i = 0; i < tr_arr.length; i++){
            let tr = tr_arr[i];
            tr.style.color = "";
            let date_chosen = tr.children[7].textContent
            let t_res = is2DateValid(date_chosen, date_to_choose);
            if(false == t_res){
                console.log(date_to_choose, "\t", tr.children[5].textContent, "\t",date_chosen, "冲突了");
                tr.style.color = "red";
                new_tr_arr.splice(0, 0, tr);
            }else{
                tr.style.color = "";
                new_tr_arr.push(tr);
            }
        }
        bottom_table_tag.innerHTML = '';
        for(let i = 0; i < new_tr_arr.length; i++){
            bottom_table_tag.appendChild(new_tr_arr[i]);
        }
    }

    try{
        let top_table_tag = document.querySelector("html > frameset").querySelector("frameset").getElementsByTagName("frame")[1].contentDocument.getElementById("iframe1").contentDocument.querySelector("#table_t").querySelector("tbody");
        let bottom_table_tag = document.querySelector("html > frameset").querySelector("frameset").getElementsByTagName("frame")[1].contentDocument.getElementById("iframe2").contentDocument.querySelector("#content_1").querySelector("tbody");
        top_table_tag.addEventListener(
            "mouseover",
            (event) => {
                let parent_tr_tag = event.srcElement.parentNode;
                parent_tr_tag.style.color = "red";
                let kechengming = parent_tr_tag.children[3].textContent;
                kechengming = strip(kechengming);
                let kechenghao = parent_tr_tag.children[1].textContent;
                kechenghao = strip(kechenghao);
                let shangkeshijian = parent_tr_tag.children[6].textContent;
                shangkeshijian = strip(shangkeshijian);
                reset_table(top_table_tag);
                reset_table(bottom_table_tag);
                update_chosen_table(shangkeshijian, bottom_table_tag);
                console.log("update finished");
            },
            false,
        );
    }catch{
    }

}
setInterval(run_bijiaorenshu, 1000);
setInterval(run_bijiaoshijian, 1000);
