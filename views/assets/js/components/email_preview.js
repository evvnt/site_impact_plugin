class EmailPreview {

  constructor(element) {
    console.debug('\tSiteImpact EmailPreview');
    this.previewFrame = element.querySelector('#v-email_preview__frame');
    this.editButton = element.querySelector('#v-email_preview__edit');
    this.cancelButton = element.querySelector('#v-email_preview__cancel');
    this.saveButton = element.querySelector('#v-email_preview__save');
    this.sendButton = element.querySelector('#v-email_preview__send');
    this.opts = JSON.parse(element.dataset.emailOptions);
    this.element = element;
    this.editing = false;
    this.originalState = {}

    this.loadPreview();

    this.previewFrame.addEventListener('load', this.setFrameHeight.bind(this));
    this.editButton.addEventListener('click', this.toggleEditMode.bind(this));
    this.cancelButton.addEventListener('click', this.cancelEdits.bind(this));
    this.saveButton.addEventListener('click', this.saveClickCallback());
    this.sendButton.addEventListener('click', this.sendEmailClickCallback());
  }
  // constructor(opts) {
  //   var self = this;
  //   self.opts = opts;
  //
  //   self.editing = false;
  //   self.originalState = {};
  //
  //    TODO: Figure out banner image selector. Allow selection of existing event images?
  //   $('#image-modal').on('show.bs.modal', function (e) {
  //     // This nasty hack should mean the slider renders.
  //     setTimeout(function(){
  //       window.dispatchEvent(new Event('resize'));
  //     }, 500);
  //   });
  //
  //   $('#image-modal-select').on('click', function() {
  //     self.bannerImage().attr('src', $('.slick-current img').attr('src'))
  //     self.bannerImage().attr('data-id', $('.slick-current img').data('id'))
  //     $('#image-modal').modal('hide');
  //   });
  //
  //   $('#image-modal-cancel').on('click', function() {
  //     $('#image-modal').modal('hide');
  //   });
  //
  //   this.loadPreview();
  // }

  loadPreview() {
    this.previewFrame.setAttribute("src",this.opts.preview_url)
  }

  setFrameHeight() {
    let height = this.previewFrame.contentWindow.document.body.scrollHeight + 'px';
    this.previewFrame.setAttribute('height', height);
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
    return this.iframeBody().querySelector('th.banner').querySelector('img');
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
      changes['email_campaign_image_id'] = this.bannerImage().dataset['id'];
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

