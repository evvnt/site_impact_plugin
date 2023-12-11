class EmailPreview {

  constructor(element) {
    console.debug('\tSiteImpact EmailPreview');
    this.previewFrame = element.querySelector('#v-email_preview__frame');
    this.editButton = element.querySelector('#v-email_preview__edit');
    this.cancelButton = element.querySelector('#v-email_preview__cancel');
    this.saveButton = element.querySelector('#v-email_preview__save');
    this.sendButton = element.querySelector('#v-email_preview__send');
    this.opts = JSON.parse(element.dataset.emailOptions);
    this.editing = false;
    this.originalState = {}

    console.dir(this.opts);

    this.loadPreview();
    this.previewFrame.addEventListener('load', this.setFrameHeight.bind(this));

    this.editButton.addEventListener('click', this.toggleEditMode.bind(this));
    this.cancelButton.addEventListener('click', this.cancelEdits.bind(this));
    this.saveButton.addEventListener('click', this.saveEdits.bind(this));
    this.sendButton.addEventListener('click', this.sendEmailPreview.bind(this));
  }
  // constructor(opts) {
  //   var self = this;
  //   self.opts = opts;
  //
  //   self.editing = false;
  //   self.originalState = {};
  //
  //   $("iframe.email-preview")
  //     .on("load", function() {
  //       $(this).css("height", $(this).contents().height() + "px");
  //       self.bannerImage().parent().on('click', function() {
  //         if (self.bannerImage().hasClass('editing')) {
  //           $('#image-modal').modal('show');
  //         }
  //       });
  //     });
  //
  //   $('#email-edit').on('click', function() {
  //     self.toggleEditMode();
  //   });
  //
  //   $('#email-edit-cancel').on('click', function() {
  //     self.cancelEdits();
  //   });
  //
  //   $('#email-edit-save').on('click', function() {
  //     self.saveEdits();
  //   });
  //
  //   $('#email-send-to-me').on('click', function() {
  //     self.sendEmailPreview();
  //   });
  //
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
      this.saveButton.classList.remove('v-hidden');
      this.cancelButton.classList.remove('v-hidden');
    } else {
      this.editButton.classList.remove('v-hidden');
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

  saveEdits() {
    let changes = {};
    for (let element of this.editableFields()) {
      changes[element.dataset.contenteditableIdentifier] = element.textContent.trim();
    }
    let imageId = this.bannerImage().data('id');

    // TODO: Needs to dispatch event defined in POM
    // $.post(this.opts.persistUrl, {email_campaign_content: changes, email_campaign_image_id: imageId}, {dataType: 'json'})
    //   .done(function() {
    //     self.toggleEditMode();
    //     self.loadPreview();
    //   })
    //   .fail(function() {
    //     alert( "Oops - there was an error saving your changes!" );
    //   });
  }

  sendEmailPreview() {
    // TODO: Needs to dispatch event defined in POM
    // var $buttonText = $('#email-send-to-me span');
    // var buttonContent = $buttonText.text()
    // $buttonText.text('Sending...');
    // $.post(this.opts.previewEmailUrl, {dataType: 'json'})
    //   .done(function(response) {
    //     alert(response.message);
    //     $buttonText.text(buttonContent);
    //   })
    //   .fail(function() {
    //     alert( "Oops - there was an error sending your mail!" );
    //   });
  }
}

