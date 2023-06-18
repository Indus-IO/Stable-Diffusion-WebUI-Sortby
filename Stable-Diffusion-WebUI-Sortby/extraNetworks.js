function setupExtraNetworksForTab(tabname) {
    gradioApp().querySelector('#' + tabname + '_extra_tabs').classList.add('extra-networks');

    var tabs = gradioApp().querySelector('#' + tabname + '_extra_tabs > div');
    var search = gradioApp().querySelector('#' + tabname + '_extra_search textarea');
    var refresh = gradioApp().getElementById(tabname + '_extra_refresh');

    search.classList.add('search');
    tabs.appendChild(search);
    tabs.appendChild(refresh);

    var applyFilter = function () {
        var searchTerm = search.value.toLowerCase();

        gradioApp().querySelectorAll('#' + tabname + '_extra_tabs div.card').forEach(function (elem) {
            var searchOnly = elem.querySelector('.search_only');
            var text = elem.querySelector('.name').textContent.toLowerCase() + " " + elem.querySelector('.search_term').textContent.toLowerCase();

            var visible = text.indexOf(searchTerm) != -1;

            if (searchOnly && searchTerm.length < 4) {
                visible = false;
            }

            elem.style.display = visible ? "" : "none";
        });
    };

    search.addEventListener("input", applyFilter);
    applyFilter();

    extraNetworksApplyFilter[tabname] = applyFilter;

    let ch_sortby = document.createElement("select");//added
    ch_sortby.id = "sortby";//added
    ch_sortby.className = "lg secondary gradio-button svelte-1ipelgc";//added

    ch_sortby.appendChild(addOption("이름(오름차순)", "name-asc"));//added
    ch_sortby.appendChild(addOption("이름(내림차순)", "name-desc"));//added

    ch_sortby.appendChild(addOption("수정된 날짜(오름차순)", "time-asc"));//added
    ch_sortby.appendChild(addOption("수정된 날짜(내림차순)", "time-desc"));//added

    ch_sortby.appendChild(addOption("파일 크기(내림차순)", "size-asc"));//added
    ch_sortby.appendChild(addOption("파일 크기(오름차순)", "size-desc"));//added

    ch_sortby.appendChild(addOption("최근 불러온", "recently-asc"));//added

    tabs.appendChild(ch_sortby);//added

    ch_sortby.addEventListener("change", function () {//added
        let selectedValue = ch_sortby.value;//added
        let [sortType, sortOrder] = ch_sortby.value.split("-");//added

        console.time("Sort Elasped Time");//added
        var items = gradioApp().querySelectorAll('#' + tabname + '_extra_tabs div.card');//added
        var itemsArray = Array.from(items);//added

        if (sortType == "recently") {//added
            console.log("A");//added
            itemsArray.sort(function (a, b) {//added
                var aTC = a.querySelector('.name').textContent;//added
                var bTC = b.querySelector('.name').textContent;//added

                var aIndex = recently.indexOf(aTC);//added
                var bIndex = recently.indexOf(bTC);//added

                if (aIndex !== -1 && bIndex !== -1)//added
                    return aIndex - bIndex;//added
                else if (aIndex !== -1)//added
                    return -1;//added
                else if (bIndex !== -1)//added
                    return 1;//added
                else//added
                    return 0;//added
            });//added
        } else {//added
            itemsArray.sort(function (a, b) {//added
                var aTC = a.querySelector('.' + sortType).textContent;//added
                var bTC = b.querySelector('.' + sortType).textContent;//added

                if (sortType == "size") {//added
                    if (sortOrder == "asc")//added
                        return bTC - aTC;//added
                    else//added
                        return aTC - bTC;//added
                }

                if (sortOrder == "asc")//added
                    return aTC.localeCompare(bTC);//added
                else//added
                    return bTC.localeCompare(aTC);//added
            });//added
        }//added

        itemsArray.forEach(function (item) {//added
            item.parentNode.appendChild(item);//added
        });//added

        console.timeEnd("Sort Elasped Time");//added
    });//added

    function addOption(text, value) {//added
        let option = document.createElement("option");//added
        //option.className = "lg secondary gradio-button";

        option.text = text;//added
        option.value = value;//added

        option.style.color = "black";//added
        option.style.fontSize = "150%";//added

        return option;//added
    }//added
}

function applyExtraNetworkFilter(tabname) {
    setTimeout(extraNetworksApplyFilter[tabname], 1);
}

var extraNetworksApplyFilter = {};
var activePromptTextarea = {};

function setupExtraNetworks() {
    setupExtraNetworksForTab('txt2img');
    setupExtraNetworksForTab('img2img');

    function registerPrompt(tabname, id) {
        var textarea = gradioApp().querySelector("#" + id + " > label > textarea");

        if (!activePromptTextarea[tabname]) {
            activePromptTextarea[tabname] = textarea;
        }

        textarea.addEventListener("focus", function () {
            activePromptTextarea[tabname] = textarea;
        });
    }

    registerPrompt('txt2img', 'txt2img_prompt');
    registerPrompt('txt2img', 'txt2img_neg_prompt');
    registerPrompt('img2img', 'img2img_prompt');
    registerPrompt('img2img', 'img2img_neg_prompt');
}

onUiLoaded(setupExtraNetworks);

var re_extranet = /<([^:]+:[^:]+):[\d.]+>/;
var re_extranet_g = /\s+<([^:]+:[^:]+):[\d.]+>/g;

function tryToRemoveExtraNetworkFromPrompt(textarea, text) {
    var m = text.match(re_extranet);
    var replaced = false;
    var newTextareaText;
    if (m) {
        var partToSearch = m[1];
        newTextareaText = textarea.value.replaceAll(re_extranet_g, function (found) {
            m = found.match(re_extranet);
            if (m[1] == partToSearch) {
                replaced = true;
                return "";
            }
            return found;
        });
    } else {
        newTextareaText = textarea.value.replaceAll(new RegExp(text, "g"), function (found) {
            if (found == text) {
                replaced = true;
                return "";
            }
            return found;
        });
    }

    if (replaced) {
        textarea.value = newTextareaText;
        return true;
    }

    return false;
}

function cardClicked(tabname, textToAdd, allowNegativePrompt) {
    var textarea = allowNegativePrompt ? activePromptTextarea[tabname] : gradioApp().querySelector("#" + tabname + "_prompt > label > textarea");

    if (!tryToRemoveExtraNetworkFromPrompt(textarea, textToAdd)) {
        textarea.value = textarea.value + opts.extra_networks_add_text_separator + textToAdd;
    }

    updateInput(textarea);
}

function saveCardPreview(event, tabname, filename) {
    var textarea = gradioApp().querySelector("#" + tabname + '_preview_filename  > label > textarea');
    var button = gradioApp().getElementById(tabname + '_save_preview');

    textarea.value = filename;
    updateInput(textarea);

    button.click();

    event.stopPropagation();
    event.preventDefault();
}

function extraNetworksSearchButton(tabs_id, event) {
    var searchTextarea = gradioApp().querySelector("#" + tabs_id + ' > div > textarea');
    var button = event.target;
    var text = button.classList.contains("search-all") ? "" : button.textContent.trim();

    searchTextarea.value = text;
    updateInput(searchTextarea);
}

var globalPopup = null;
var globalPopupInner = null;
function popup(contents) {
    if (!globalPopup) {
        globalPopup = document.createElement('div');
        globalPopup.onclick = function () {
            globalPopup.style.display = "none";
        };
        globalPopup.classList.add('global-popup');

        var close = document.createElement('div');
        close.classList.add('global-popup-close');
        close.onclick = function () {
            globalPopup.style.display = "none";
        };
        close.title = "Close";
        globalPopup.appendChild(close);

        globalPopupInner = document.createElement('div');
        globalPopupInner.onclick = function (event) {
            event.stopPropagation(); return false;
        };
        globalPopupInner.classList.add('global-popup-inner');
        globalPopup.appendChild(globalPopupInner);

        gradioApp().appendChild(globalPopup);
    }

    globalPopupInner.innerHTML = '';
    globalPopupInner.appendChild(contents);

    globalPopup.style.display = "flex";
}

function extraNetworksShowMetadata(text) {
    var elem = document.createElement('pre');
    elem.classList.add('popup-metadata');
    elem.textContent = text;

    popup(elem);
}

function requestGet(url, data, handler, errorHandler) {
    var xhr = new XMLHttpRequest();
    var args = Object.keys(data).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }).join('&');
    xhr.open("GET", url + "?" + args, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var js = JSON.parse(xhr.responseText);
                    handler(js);
                } catch (error) {
                    console.error(error);
                    errorHandler();
                }
            } else {
                errorHandler();
            }
        }
    };
    var js = JSON.stringify(data);
    xhr.send(js);
}

function extraNetworksRequestMetadata(event, extraPage, cardName) {
    var showError = function () {
        extraNetworksShowMetadata("there was an error getting metadata");
    };

    requestGet("./sd_extra_networks/metadata", { page: extraPage, item: cardName }, function (data) {
        if (data && data.metadata) {
            extraNetworksShowMetadata(data.metadata);
        } else {
            showError();
        }
    }, showError);

    event.stopPropagation();
}
