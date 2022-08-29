var dialogData = {
	
	'button_resume': {
		
		trueButtonText: 'ДА',
				
		falseButtonText: 'НЕТ',
				
		questionText: 'Анкета заполнена и готова к отправке.<p>Хотите изменить анкету?</p>'
		
	},
	
	'canCreate': {
		
		trueButtonText: '',
				
		falseButtonText: '',
				
		questionText: 'В данном проекте, запись разговора с респондентом будет включена автоматически в момент открытия анкеты.'
		
	},
	
	'cannotCreate': {
		
		trueButtonText: 'Отмена',
				
		falseButtonText: '',
		
		extButtonText: 'Запись на другом устройстве',
				
		questionText: 'В данном проекте, запись разговора с респондентом будет включена автоматически в момент открытия анкеты.<p><b>Для этого нужно разрешение на запись аудио.</b> Разрешите доступ к микрофону и обновите страницу.</p><p>В случае выбора записи на другом устройстве, файл записи нужно будет прислать отдельно</p><p><b>Без файла записи анкета не будет принята!</b></p>'
		
	},
	
	'authError': {
		
		trueButtonText: '',
				
		falseButtonText: '',
				
		questionText: 'Не заполнены данные для авторизации'
		
	},
	
	'login_error': {
		
		trueButtonText: '',
				
		falseButtonText: '',
				
		questionText: 'Запрос на вход отклонён'
		
	},
	
	'notSend': {
		
		trueButtonText: '',
				
		falseButtonText: '',
				
		questionText: 'Что-то пошло не так. Повторите отправку позже.'
		
	},
	
	'notServer': {
		
		trueButtonText: '',
				
		falseButtonText: '',
				
		questionText: 'Произошла ошибка. Перезагрузите страницу и попробуйте ещё раз.'
		
	}
	
}

class ConfirmDialog {

	constructor({ 
	
		questionText, 
		
		trueButtonText, 
		
		falseButtonText, 
		
		extButtonText, 
		
		parent }) {
	  
		this.questionText = questionText || '';
		
		this.trueButtonText = trueButtonText || 'ОК';
		
		this.falseButtonText = falseButtonText || '';
		
		this.extButtonText = extButtonText || '';
		
		this.parent = parent || document.body;

		this.dialog = undefined;
		
		this.trueButton = undefined;
		
		this.falseButton = undefined;

		this._createDialog();
		
		this._appendDialog();
	
	}

	confirm() {
	  
		return new Promise((resolve, reject) => {
			
			const somethingWentWrongUponCreation = ! this.dialog || ! this.trueButton || ! this.falseButton;
		  
			if (somethingWentWrongUponCreation) {
			  
				reject('Someting went wrong when creating the modal');
			
				return;
			
			}

			this.dialog.showModal();

			this.trueButton.addEventListener("click", () => {
			  
				resolve(true);
			
				this._destroy();
			
			});

			this.falseButton.addEventListener("click", () => {
			  
				resolve(false);
			
				this._destroy();
			
			});
			
			this.extButton.addEventListener("click", () => {
			  
				resolve('ext');
			
				this._destroy();
			
			});
		  
		});
	
	}

	_createDialog() {
	  
		this.dialog = elem('dialog', {classname: 'confirm-dialog'});

		const question = elem('div', {classname: 'confirm-dialog-question', innerhtml: this.questionText});
		
		this.dialog.appendChild(question);

		const buttonGroup = elem('div', {classname: 'confirm-dialog-button-group'});
		
		this.dialog.appendChild(buttonGroup);
		
		this.extButton = elem('button', {classname: 'confirm-dialog-button confirm-dialog-button--ext', type: 'button', textcontent: this.extButtonText});
		
		buttonGroup.appendChild(this.extButton);
		
		this.divider1 = elem('span', {classname: 'dialog-divider'});
		
		buttonGroup.appendChild(this.divider1);

		this.falseButton = elem('button', {classname: 'confirm-dialog-button confirm-dialog-button--false', type: 'button', textcontent: this.falseButtonText});
		
		buttonGroup.appendChild(this.falseButton);
		
		this.divider2 = elem('span', {classname: 'dialog-divider'});
		
		buttonGroup.appendChild(this.divider2);
		
		this.trueButton = elem('button', {classname: 'confirm-dialog-button confirm-dialog-button--true', type: 'button', textcontent: this.trueButtonText});
		
		buttonGroup.appendChild(this.trueButton);

	}

	_appendDialog() {
		  
		this.parent.appendChild(this.dialog);
		
	}

	_destroy() {
	  
		this.parent.removeChild(this.dialog);
		
		delete this;
	
	}
  
}

async function al(e) {
	
	let id = typeof(e.target) != 'undefined' ? e.target.id : e;
	
	switch (id) {
		
		case 'rec_alert':
		
			const dialog1 = new ConfirmDialog(dialogData[id]);
			
			await dialog1.confirm();
		
		break;
		
		case 'button_new':
		
			const dialog2 = new ConfirmDialog(recordPermission ? dialogData.canCreate : dialogData.cannotCreate);
			
			if (recordPermission) {
				
				const canCreateNew = await dialog2.confirm();
				
				if (canCreateNew) anStart();
				
			} else {
				
				const oDevice = await dialog2.confirm();
				
				if (oDevice == 'ext') anStart(false);
				
			}
		
		break;
		
		case 'login_error':
		
			const dialog3 = new ConfirmDialog(dialogData[id]);
			
			await dialog3.confirm();
		
		break;
		
		case 'authError':
		
			const dialog5 = new ConfirmDialog(dialogData[id]);
			
			await dialog5.confirm();
		
		break;
		
		case 'button_resume':
		
			const dialog4 = new ConfirmDialog(dialogData[id]);
			
			const canResume = await dialog4.confirm();
			
			if (canResume) {
				
				LA = e.target.dataset.an;
				
				if (/4|5/.test(AN[LP][LA].condition)) {
				
					LI = AN[LP][LA].sti;
						
					LV = AN[LP][LA].lv1;
						
					EVG = AN[LP][LA].evg;
					
					L.next(LI);
						
					wm(1, false);
						
					if (RL[LP].hasOwnProperty(LV) && RL[LP][LV][0].activity == 'vis') rule(LV);
						
				}
				
			}
		
		break;
		
	}
	
}

