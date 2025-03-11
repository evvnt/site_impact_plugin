class EmailPreview {

  constructor(element) {
    console.debug('\tSiteImpact EmailPreview');
    this.previewFrame = element.querySelector('#v-email_preview__frame');
    this.editButton = element.querySelector('#v-email_preview__edit');
    this.cancelButton = element.querySelector('#v-email_preview__cancel');
    this.saveButton = element.querySelector('#v-email_preview__save');
    this.sendButton = element.querySelector('#v-email_preview__send');
    this.opts = JSON.parse(element.dataset.emailOptions);
    this.maxHeight = element.dataset.maxHeight;
    this.element = element;
    this.viewOnly = element.dataset.viewOnly;
    this.editing = false;
    this.originalState = {}

    this.loadPreview();

    this.previewFrame.addEventListener('load', this.setFrameHeight.bind(this));

    if (this.viewOnly === 'false') {
      this.editButton.addEventListener('click', this.toggleEditMode.bind(this));
      this.cancelButton.addEventListener('click', this.cancelEdits.bind(this));
      this.saveButton.addEventListener('click', this.saveClickCallback());
    }

    this.sendButton.addEventListener('click', this.sendEmailClickCallback());
  }

  loadPreview() {
    this.previewFrame.setAttribute("src",this.opts.preview_url)
  }

  setFrameHeight() {
    if (this.maxHeight) {
      this.previewFrame.setAttribute('height', this.maxHeight);
    } else {
      this.previewFrame.setAttribute('height', this.previewFrame.contentWindow.document.body.scrollHeight + 'px');
    }
  }

  toggleEditMode() {
    this.editing = !this.editing;

    if (this.editing === true) {
      this.editButton.classList.add('v-hidden');
      this.sendButton.classList.add('v-hidden');
      this.saveButton.classList.remove('v-hidden');
      this.cancelButton.classList.remove('v-hidden');
    } else {
      this.editButton.classList.remove('v-hidden');
      this.sendButton.classList.remove('v-hidden');
      this.saveButton.classList.add('v-hidden');
      this.cancelButton.classList.add('v-hidden');
    }

    if (this.editing) {
      console.log('Editing');
      this.enableContentEditable();
    } else {
      console.log('Not editing');
      this.disableContentEditable();
    }
  }

  editableFields() {
    return this.iframeBody().querySelectorAll('[data-contenteditable-identifier]')
  }

  bannerImage() {
    return this.iframeBody().querySelector('th.banner')?.querySelector('img');
  }

  iframeBody() {
    return this.previewFrame.contentWindow.document.body;
  }

  enableContentEditable() {

    this.originalState = {};

    for (let element of this.editableFields()) {
      this.originalState[element.dataset.contenteditableIdentifier] = element.textContent;
      element.classList.add('editing');
      element.setAttribute('contenteditable','true');
    }

    // this.originalState['banner-image'] = self.bannerImage().parent().html();
    // self.bannerImage().addClass('editing');

    this.iframeBody().classList.add('edit-mode');
  }

  disableContentEditable() {

    for (let element of this.editableFields()) {
      this.originalState[element.dataset.contenteditableIdentifier] = element.textContent;
      element.classList.remove('editing');
      element.setAttribute('contenteditable','false');
    }

    // self.bannerImage().removeClass('editing');

    this.iframeBody().classList.remove('edit-mode');
  }

  cancelEdits() {
    if (!confirm('Cancel your changes - this will revert your edits - are you sure?')) {
      return;
    }

    for (let element of this.editableFields()) {
      element.innerHTML = this.originalState[element.dataset.contenteditableIdentifier];
    }

    // self.bannerImage().parent().html(self.originalState['banner-image']);

    this.toggleEditMode();
  }

  saveClickCallback() {
    return () => {
      let changes = {};
      for (let element of this.editableFields()) {
        changes[element.dataset.contenteditableIdentifier] = element.textContent.trim();
      }
      changes['email_campaign_image_id'] = this.bannerImage()?.dataset['id'];
      this.dispatchEvent('save', {content: changes});
      this.toggleEditMode();
    }
  }

  sendEmailClickCallback() {
    return () => {
      this.dispatchEvent('send');
    }
  }

  dispatchEvent(name, data = undefined) {
    console.debug(`EmailPreview: dispatch event: ${name}`);
    console.dir(data);
    const event = new CustomEvent(name, {composed: true, detail: data});
    this.element.dispatchEvent(event);
  }

}

