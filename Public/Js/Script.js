let CANSEND = true;

let CURRENTUSER = {};

let DIFFERENCE;

let FILEDATA = {};

let FILTER = {};

let FILTERLIMIT = {};

let JF = false, JL, JC;

let LIMITDATA;

let MYID = 0;

let PROJECTID = 0;

let PROJECT = {};

let PROJECTS = {};

let REGTYPE;

let REPORTSTATUS = {0: 0};

let RESPONSE = {};

let SELECTION = [];

let STATUS = 0;

let USERS = {};

let USERCOLS;

let VIEWDATA = {};

let VIEWSTRUCTURE;

let MAPSTRUCTURE;

let USERSTRUCTURE;

let USERSTATUS = {
			
	1: 'Авторизован',
			
	2: 'В процессе',
			
	3: 'Завершён',
			
	4: 'Прерван (скрин)',
	
	5: 'Прерван (лимит)'
			
};

let QDATA;

let QBLOCK;

let Q = function() {
	
	this.Obj = {
	
		QN: '',
	
		QName: '',
	
	    QExpl: ''
		
	}
	
	return this.Obj;
	
}

let WORKFILTER = {};

let WORKUSER;


document.addEventListener('DOMContentLoaded', function() {
	
	ImportJS('ua-parser.min, md5, Dialog');

	if (document.querySelector('#LoginSubmit')) document.querySelector('#LoginSubmit').addEventListener('click', listener);
	
});

function ReloadContainer(Target, El) {
		
	if (Target.firstElementChild != null) Target.replaceChild(El, Target.firstElementChild);
							
	else Target.appendChild(El);
	
}

let sendRequest = {
	
	Send: function(location, param) {
	
		let R = false;
		
		let TABLE = {};
		
		if (window.XMLHttpRequest) {
			
			R = new XMLHttpRequest();

		} else if (window.ActiveXObject) {

			try {
				
				R = new ActiveXObject('Msxml2.XMLHTTP');
				
			} catch (e) {
			
				try {
					
					R = new ActiveXObject('Microsoft.XMLHTTP');
					
				} catch (e) {}
				
			}
		
		}
		
		if (R) {
			
			R.onreadystatechange = function() {
				
				if (R.readyState == XMLHttpRequest.DONE) { 

					if (R.status == 200 && R.responseText.length) {
						
						RESPONSE = JSON.parse(R.responseText);
						
						switch (RESPONSE.Action) {
							
							case 'Logn successful':
							
								MYID = RESPONSE.Id;
								
								STATUS = RESPONSE.Status;
							
								[].forEach.call(RESPONSE.Projects, function(x) {
									
									PROJECTS[x.id] = x;
									
									document.querySelector('#ProjectList').append(new elem('div', {id: 'ProjectItem', classname: 'project-item', attr: 'data-project=' + x.id, textcontent: x.Name, addevent: 'click'}));
									
								});
								
								document.querySelector('#LoginPage').classList.add('hidden');
								
								document.querySelector('#LeftContainer').classList.remove('hidden');
								
								if (RESPONSE.Projects.length == 1) document.querySelector('#ProjectList').children[1].click();

							break;
							
							case 'User Remove':

								document.querySelector('.user-string[id="' + WORKUSER + '"]').remove();
									
								document.querySelector('#UserBox').remove();
									
								WORKUSER = null;

							break;
							
							case 'Project data':
							
								PROJECTID = + RESPONSE.ProjectId;
							
								PROJECT = PROJECTS[PROJECTID];
								
								REGTYPE = PROJECT.AuthType.match(/(?<type>^[^\[]+)\[?(?<data>[^\]]+)?\]?(?<mode>.+$)?/);
								
								VIEWDATA = RESPONSE.ViewData;
								
								FILEDATA = RESPONSE.FileData;
								
								LIMITDATA = RESPONSE.LimitData;

								VIEWSTRUCTURE = [];
								
								MAPSTRUCTURE = [];

								USERSTRUCTURE = [];
								
								FILTER = {};

								if (PROJECT.ViewMap != null) {

									let VData = PROJECT.ViewMap.split(',');
									
									for (let i = 0; i < VData.length; i ++) {
									
										let MapData = VData[i].match(/(?<number>^.+)\[(?<name>.+)\]/);
										
										VIEWSTRUCTURE.push(MapData.groups.name);
										
										MAPSTRUCTURE.push(MapData.groups.number);
										
									}
									
								}
								
								let UData = [...PROJECT.ViewData.matchAll(/\[([^\[\]]+)\]/g)];
								
								for (let i = 0; i < UData.length; i ++) USERSTRUCTURE.push(UData[i][1]);
								
								SELECTION = VIEWDATA;
								
								BuildUserTable(SELECTION, true);

								Cleaner(document.querySelector('#FilterContainer'));
								
								let FilterIndex = 0;
								
								for (let f in FILTER) {

									let FilterItem = document.querySelector('#FilterTemplate').cloneNode(true);
									
									FilterItem.id = 'FilterBox';
									
									FilterItem.setAttribute('iindex', FilterIndex);

									FilterItem.querySelector('#Filter').setAttribute('data-filter-index', FilterIndex);
									
									FilterItem.querySelector('#Filter').setAttribute('data-filter-value', 0);
									
									let FilterLimit = false;

									for (let fname in FILTER[f]) {
										
										let FilterContainer = new elem('div', {id: 'Filter', classname: 'filter', attr: 'data-filter-index=' + FilterIndex + '*data-filter-value=' + FILTER[f][fname].Index, addevent: 'click'});
										
										FilterContainer.append(new elem('span', {classname: 'filter-name-container', textcontent: fname}));
										
										FilterContainer.append(new elem('span', {classname: 'limit-container', textcontent: (FILTER[f][fname].Limiting != 0 ? FILTER[f][fname].Contains + ' / ' + FILTER[f][fname].Limiting : '')}));
										
										if (FILTER[f][fname].Limiting != 0) FilterLimit = true;
										
										if (STATUS == 2) {
											
											
											
										}

										FilterItem.append(FilterContainer);
	
									}
									
									if (FilterLimit) {
										
										FilterItem.setAttribute('data-filter-action', 'copy');
										
										FilterItem.querySelector('#FilterAction').classList.add('action-copy');
										
										FilterItem.querySelector('#FilterAction').addEventListener('click', listener);
										
									}
									
									FilterItem.querySelector('.filter-name .caption').textContent = f;
									
									FilterItem.classList.remove('hidden');
									
									FilterItem.classList.add('filter-box');
									
									FilterItem.addEventListener('click', listener);

									document.querySelector('#FilterContainer').append(FilterItem);
									
									FilterIndex ++;
									
								}

								for (let s = 0; s <= 5; s ++) {
						
									if (REPORTSTATUS.hasOwnProperty(s)) {
										
										document.querySelector('.report[data-index="' + s + '"] .content').textContent = REPORTSTATUS[s];
										
										document.querySelector('.report[data-index="' + s + '"]').classList.remove('hidden');
												
									} else document.querySelector('.report[data-index="' + s + '"]').classList.add('hidden');
				
								}
								
								document.querySelector('.report[data-active]').removeAttribute('data-active');
								
								document.querySelector('.report[data-index="0"]').setAttribute('data-active', '');
								
								document.querySelector('#ProjectList').removeAttribute('open');
								
								document.querySelector('.project-name .content').textContent = PROJECTS[PROJECTID].Name;

								document.querySelector('.right-container').classList.remove('hidden');

								// let JournalMode = PROJECTS[PROJECTID].Version.match(/Journal\[(.*)\]/);

								// if (JournalMode != null) {
									
									// JournalMode = JournalMode[1].split(',');
									
									// JF = JournalMode[0];
									
									// JL = JournalMode[1];
									
									// JC = JournalMode[2];
									
								// }
							
							break;

						}
						
					} else alert('Произошла ошибка. Перезагрузите страницу и попробуйте ещё раз.');
					
					CANSEND = true;
					
				}
				
			}
			
			R.open('POST', location);

			R.send(param);
			
		} else console.log("NOT AJAX");
	
	}
	
}

function BuildUserTable(data, init = false, sort = false) {
	
	let Parser = new UAParser();
	
	let ParseResult;
	
	if (WORKUSER != null) {
					
		document.querySelector('.user-string[id="' + WORKUSER + '"]').classList.remove('user-active');
		
		document.querySelector('#UserBox').remove();
		
		WORKUSER = null;
		
	}
	
	if (sort === false && document.querySelector('#UserData') != null) document.querySelector('#UserData').remove();
	
	let UserData;
	
	if (sort === false) {
						
		REPORTSTATUS = {0: 0};
		
		UserData = document.querySelector('#UserTemplate').cloneNode(true);
			
		UserData.id = 'UserData';
		
		UserData.className = 'user-container';
	
	} else {
		
		UserData = document.querySelector('#UserData');
		
		Cleaner(UserData.querySelectorAll('.user-string'));
		
	}
	
	[].forEach.call(data, function(x, i) {
		
		if (sort === false) {

			if (! REPORTSTATUS.hasOwnProperty(x.Status)) REPORTSTATUS[x.Status] = 1;
		
			else REPORTSTATUS[x.Status] ++;
		
			REPORTSTATUS[0] ++;
			
		}
		
		let UserString = UserData.querySelector('#UserStringTemplate').cloneNode(true);

		UserString.id = x.Uid;

		UserString.className = 'user-string';

		if (STATUS != 3) UserString.addEventListener('dblclick', listener);

		UserString.querySelector('#LoginData').textContent = x.LoginData;
		
		UserString.querySelector('#DateTime').textContent = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric'}).format(new Date(x.TimeStamp));
		
		//Parser.setUA(x.UserAgent);
		
		//ParseResult = Parser.getResult();
		
		UserString.querySelector('#UserAgent').textContent = x.UserAgent;//ParseResult.browser.name + (typeof(ParseResult.device.vendor) != 'undefined' ? ', ' + ParseResult.device.vendor : '') + (typeof(ParseResult.device.model) != 'undefined' ? ', ' + ParseResult.device.model : (typeof(ParseResult.os.name) != 'undefined' ? ', ' + ParseResult.os.name + ((typeof(ParseResult.os.version) != 'undefined' ? ' ' + ParseResult.os.version : '')) : '')); 
		
		UserString.querySelector('#Status').textContent = USERSTATUS[x.Status];
		
		UserString.querySelector('#StateIndex').textContent = x.StateIndex;
		
		let BoxData = VIEWSTRUCTURE.concat(USERSTRUCTURE);
		
		if (sort === false) [].forEach.call(UserData.querySelectorAll('#WorkCaption th'), function(d) { d.addEventListener('click', listener) });
		
		[].forEach.call(BoxData, function(d, j) {
		
			if (i == 0 && sort === false) UserData.querySelector('#WorkCaption').append(new elem('th', {id: 'UserCaption', classname: 'user-caption', textcontent: d, attr: 'data-sort-name=' + d + '*data-sort-type=string', addevent: 'click'}));

			let ContentData = x[d] != null ? x[d].match(/\[?(?<index>\d+)?\]?(?<data>.+)/) : null;
		
			UserString.append(new elem('td', {id: 'BoxData_' + j, classname: 'user-content', textcontent: (ContentData ? ContentData.groups.data : '')}));
		
		});
		
		USERCOLS = UserData.querySelectorAll('#WorkCaption th').length;

		if (init) for (let j = 0; j < VIEWSTRUCTURE.length; j ++) {
			
			let FilterName = VIEWSTRUCTURE[j];
			
			if (! FILTER.hasOwnProperty(FilterName)) FILTER[FilterName] = {};
			
			if (x[FilterName] != null) {
			
				let NameData = x[FilterName].match(/\[?(?<index>\d+)?\]?(?<data>.+)/);
		
				if (! FILTER[FilterName].hasOwnProperty(NameData.groups.data)) FILTER[FilterName][NameData.groups.data] = {Limiting: 0, Contains: 0, Index: (NameData.groups.index ? NameData.groups.index : 0)};
				
				if (x.Limited != null) {
						
					FILTER[FilterName][NameData.groups.data].Limiting = LIMITDATA[x.Limited - 1].Limiting;
					
					FILTER[FilterName][NameData.groups.data].Contains = LIMITDATA[x.Limited - 1].Contains;
				
				}
				
			}
			
		}
		
		UserString.classList.remove('hidden');
									
		UserData.querySelector('table tbody').append(UserString);
		
	});

	document.querySelector('.right-container').append(UserData);
	
}

function listener(e) {

	let el = e.target;
	
	let FD = new FormData();
	
	if (! el.hasAttribute('id')) while ((el = el.parentNode) && ! el.hasAttribute('id'));
	
	switch (e.type) {
		
		case 'click':

			switch (el.id) {
				
				case 'LoginSubmit':
				
					let InputValue = document.querySelector('#Login input').value.trim();
				
					if (CANSEND && InputValue) {
					        
						FD.append('Login', md5(InputValue));
				
						CANSEND = false;
					
						sendRequest.Send('Public/Php/Login.php', FD);
						
					}
				
				break;
				
				case 'ProjectItem':
				
					CANSEND = false;
			
					FD.append('ProjectId', el.dataset.project);
					
					FD.append('AuthType', PROJECTS[el.dataset.project].AuthType);
					
					FD.append('Limiting', PROJECTS[el.dataset.project].Limiting);
	
					sendRequest.Send('Public/Php/GetProjectData.php', FD);

				break;
				
				case 'FilterBox':
			
					[].forEach.call(document.querySelectorAll('#FilterBox'), function(x) { if (x != el) x.removeAttribute('open') });
				
				break;
				
				case 'Download':
							
					let Parent = el.closest('.report');

					if (Parent.dataset.active == null) {
						
						Parent.click();
						
						break;
						
					}
					
					let FilterQuery = '';

					if (Object.keys(WORKFILTER).length) for (let f in WORKFILTER) FilterQuery += '&' + WORKFILTER[f][0] + '=' + WORKFILTER[f][2];
					
					let ExtFileData = [];
					
					if (FILEDATA != null && FILEDATA.length) for (let fd = REGTYPE.groups.data; fd < FILEDATA.length; fd ++) ExtFileData.push(FILEDATA[fd].fieldName);

					window.location = 'Public/Php/DownloadReport.php?p=' + PROJECTID + '&s=' + Parent.dataset.index + (JF ? '&jf=' + JF + '&jl=' + JL + '&jc=' + JC : '') + (ExtFileData.length ? '&ef=' + ExtFileData.join('*') : '') + FilterQuery;
							
				break;
				
				case 'UserCaption':

					if (el.dataset.sortDirect == null) {
						
						if (document.querySelector('#UserCaption[data-sort-direct]') != null) document.querySelector('#UserCaption[data-sort-direct]').removeAttribute('data-sort-direct');
						
						el.dataset.sortDirect = 'asc';
						
					} else el.dataset.sortDirect = el.dataset.sortDirect == 'asc' ? 'desc' : 'asc';

					SELECTION.sort(function (a, b) {
						
						if (el.dataset.sortDirect == 'asc') {
							
							return el.dataset.sortType == 'string' ? a[el.dataset.sortName] > b[el.dataset.sortName] : a[el.dataset.sortName] - b[el.dataset.sortName];
							
						} else {
							
							return el.dataset.sortType == 'string' ? a[el.dataset.sortName] < b[el.dataset.sortName] : b[el.dataset.sortName] - a[el.dataset.sortName];
							
						}
						
					});
					
					BuildUserTable(SELECTION, false, true);
									
				break;
				
				case 'Report':
				
					if (el.dataset.active == null) {
						
						SELECTION = [];
						
						document.querySelector('.report[data-active]').removeAttribute('data-active');
						
						el.setAttribute('data-active', '');

						for (let i = 0; i < Object.keys(VIEWDATA).length; i ++) {
							
							let x = VIEWDATA[i];
						
							let Correct = true;
							
							for (let f in WORKFILTER) if (! x.hasOwnProperty(f) || x[f] == null || ! x[f].includes(WORKFILTER[f][1])) {
									
								Correct = false;
								
								break;

							}
							
							if (! Correct) continue;
							
							if (x.Status != el.dataset.index && el.dataset.index > 0) continue;
							
							SELECTION.push(x);
	
						}
						
						BuildUserTable(SELECTION);
						
					}
				
				break;
				
				case 'Filter':
				
					SELECTION = [];
					
					let FilterName = el.querySelector('.filter-name-container').textContent;

					if (WORKFILTER.hasOwnProperty(VIEWSTRUCTURE[el.dataset.filterIndex])) {
						
						if (WORKFILTER[VIEWSTRUCTURE[el.dataset.filterIndex]][1] == FilterName) break;
						
						else if (el.dataset.filterValue == '0') delete WORKFILTER[VIEWSTRUCTURE[el.dataset.filterIndex]];
						
						else WORKFILTER[VIEWSTRUCTURE[el.dataset.filterIndex]] = [MAPSTRUCTURE[el.dataset.filterIndex], FilterName, el.dataset.filterValue];
						
					} else {
						
						if (el.dataset.filterValue == '0') break;
						
						else WORKFILTER[VIEWSTRUCTURE[el.dataset.filterIndex]] = [MAPSTRUCTURE[el.dataset.filterIndex], FilterName, el.dataset.filterValue];
					
					}
					
					if (el.dataset.filterValue == '0') {
						
						el.parentNode.querySelector('#FilterAction').textContent = '';
						
						if (el.parentNode.dataset.filterAction == 'copy') el.parentNode.querySelector('#FilterAction').classList.add('action-copy');
						
					} else {
						
						el.parentNode.querySelector('#FilterAction').textContent = el.querySelector('.limit-container').textContent;
						
						if (el.parentNode.dataset.filterAction == 'copy') el.parentNode.querySelector('#FilterAction').classList.remove('action-copy');
						
					}

					el.parentNode.querySelector('.content').textContent = FilterName;
					
					el.parentNode.removeAttribute('open');
					
					for (let i = 0; i < Object.keys(VIEWDATA).length; i ++) {
						
						let x = VIEWDATA[i];
						
						let Correct = true;
						
						for (let f in WORKFILTER) if (! x.hasOwnProperty(f) || x[f] == null || ! x[f].includes(WORKFILTER[f][1])) {
								
							Correct = false;
							
							break;

						}
						
						if (! Correct) continue;
						
						SELECTION.push(x);

					}
					
					BuildUserTable(SELECTION);
					
					for (let s = 0; s <= 5; s ++) {
						
						if (REPORTSTATUS.hasOwnProperty(s)) {
							
							document.querySelector('.report[data-index="' + s + '"] .content').textContent = REPORTSTATUS[s];
							
							document.querySelector('.report[data-index="' + s + '"]').classList.remove('hidden');
									
						} else document.querySelector('.report[data-index="' + s + '"]').classList.add('hidden');
	
					}
					
					document.querySelector('.report[data-active]').removeAttribute('data-active');
						
					document.querySelector('.report[data-index="0"]').setAttribute('data-active', '');
				
				break;
				
				case 'FilterAction':
				
					let ParentBox = el.closest('#FilterBox');
				
					if (ParentBox.dataset.filterAction == 'copy' && el.classList.contains('action-copy')) {
						
						e.stopPropagation();
						
						if (ParentBox.open) ParentBox.removeAttribute('open');
						
						else ParentBox.setAttribute('open', '');
						
						let CopyContainer = new elem('table', {id: 'CopyContainer', classname: 'copy-container'});
						
						let CopyTitle = new elem('tr', {});
							
						CopyTitle.append(new elem('td', {textcontent: ParentBox.querySelector('.caption').textContent}));
							
						CopyTitle.append(new elem('td', {textcontent: 'Лимит'}));
						
						CopyContainer.append(CopyTitle);
						
						[].forEach.call(ParentBox.querySelectorAll('#Filter:not([data-filter-value="0"])'), function(f) {
					
							let CopyStrng = new elem('tr', {});
							
							CopyStrng.append(new elem('td', {textcontent: f.querySelector('.filter-name-container').textContent}));
							
							CopyStrng.append(new elem('td', {textcontent: f.querySelector('.limit-container').textContent}));
							
							CopyContainer.append(CopyStrng);
							
						});
						
						document.body.append(CopyContainer);
						
						copyToClipboard(CopyContainer);
						
						CopyContainer.remove();
						
						el.setAttribute('active', '');
						
						setTimeout(() => el.removeAttribute('active', ''), 1000);
						
					}
				
				break;
				
				case 'UserDelete':
				
					if (window.confirm('УДАЛЕНИЕ пользователя, ID: ' + el.dataset.userId)) {
						
						FD.append('Id', MYID);

						FD.append('ProjectId', PROJECTID);
						
						FD.append('UserId', el.dataset.userId);

						FD.append('Action', 'UserRemove');
						
						CANSEND = false;
						
						sendRequest.Send('Public/Php/Action.php', FD);
					
					}
				
				break;

			}
		
		break;
		
		case 'dblclick':
		
			if (STATUS != 3) {
		
				el = el.parentElement;
				
				if (el.classList.contains('user-active')) break;
				
				if (WORKUSER != null) {
					
					document.querySelector('.user-string[id="' + WORKUSER + '"]').classList.remove('user-active');
					
					document.querySelector('#UserBox').remove();
					
				}
				
				WORKUSER = el.id;
				
				el.classList.add('user-active');
				
				let UserBox = document.querySelector('#UserBoxTemplate').cloneNode(true);
				
				UserBox.id = 'UserBox';
				
				UserBox.querySelector('.user-box-td').setAttribute('colspan', USERCOLS);
				
				UserBox.querySelector('.user-box-id').textContent = WORKUSER;
				
				[].forEach.call(UserBox.querySelectorAll('.user-box-button'), function(x) {
					
					x.setAttribute('data-user-id', WORKUSER);

					x.addEventListener('click', listener);

				});
				
				el.insertAdjacentElement('afterend', UserBox);

			}
			
		break;
		
		case 'change':
		
			if (el.files.length) {
				
				let SendFilesFD = new FormData();

				SendFilesFD.append('ProjectId', '11');
				
				SendFilesFD.append('AuthCount', '2');
				
				SendFilesFD.append('InsertType', document.querySelector('input:checked').value);

				[].forEach.call(el.files, function(f) { SendFilesFD.append('file[]', f) });
				
				document.querySelector('#File').value = '';

				sendRequest.Send('Public/Php/Upload.php', SendFilesFD);
						
			}
		
		break;

	}
	
}

let elem = function(el, opt) {

	this.type = opt.type || false;
	
	this.id = opt.id || false;
	
	this.classname = opt.classname || false;
	
	this.name = opt.name || false;
	
	this.value = opt.value || false;
	
	this.title = opt.title || false;
	
	this.textcontent = opt.textcontent || false;
	
	this.innerhtml = opt.innerhtml || false;
	
	this.attr = opt.attr || false;

	this.attr && (this.attrlist = this.attr.split('*'));
	
	this.addevent = opt.addevent || false;
	
	this.entity = document.createElement(el);
	
	this.type && (this.entity.type = this.type);
	
	this.classname && (this.entity.className = this.classname);
	
	this.title && (this.entity.title = this.title);
	
	if (this.addevent == 'click_') {
		
		this.entity.addEventListener('click', al);
		
	} else {
		
		this.addevent && typeof(this.addevent) == 'string' && (this.entity.addEventListener(this.addevent, listener))
		
	}
	
	if (this.addevent && typeof(this.addevent) == 'object') for (let y in this.addevent) this.entity.addEventListener(this.addevent[y], listener);
	
	if (this.attr) for (let y in this.attrlist) this.entity.setAttribute(this.attrlist[y].split('=')[0], this.attrlist[y].split('=')[1] || '');
	
	switch (el) {
		
		case 'div': case 'table': case 'thead': case 'tbody': case 'tr': case 'td': case 'th': case 'label': case 'span': case 'option': case 'datalist': case 'button': case 'dialog': case 'li':
		
			this.id && ((el == 'label') ? this.entity.setAttribute('for', this.id) : this.entity.id = this.id);
			
			this.textcontent && (this.entity.textContent = this.textcontent);
			
			this.innerhtml && (this.entity.innerHTML = this.innerhtml);
		
		break;
		
		case 'input':
		
			this.id && (this.entity.id = this.id);
			
			this.name && (this.entity.name = this.name);

			switch (this.type) {
			
				case 'checkbox': case 'radio': case 'button':
				
					this.value && (this.entity.value = this.value);
				
				break;
				
				 case 'number': case 'text':
				
					this.textcontent && (this.entity.textContent = this.textcontent);
				
				break;
			
			}
	
		break;
	
	}
	
	return this.entity;
	
}

function storage() {

	if ('localStorage' in window && window['localStorage'] !== null) {
		
		if (arguments.length > 1) {
		
			localStorage[arguments[0]] = arguments[1];
			
		} else return localStorage[arguments[0]];
		
	}

}

ImportJS = function(js) {
	
	[].forEach.call(js.split(','), function(uri) {
	
		let script = document.createElement('script');
	
		script.src  = 'Public/Js/' + uri.trim() + '.js';
	
		document.head.appendChild(script);
		
	});
	
}

function Cleaner(a) {
	
	if (a.nodeName == null) {
		
		[].forEach.call(a, function(x) { x.remove() });
		
	} else while (a.firstChild) a.removeChild(a.firstChild);
	
}

function $_GET(key) {
	
    let p = window.location.search;
	
    p = p.match(new RegExp(key + '=([^&=]+)'));
	
    return p ? p[1] : false;
	
}

async function copyToClipboard(elem) {

	let Range = document.createRange();
	
    Range.selectNode(elem);
	
    window.getSelection().addRange(Range);
	
    document.execCommand('copy');
	
	window.getSelection().removeAllRanges();

}