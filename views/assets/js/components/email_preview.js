class EmailPreview {

  constructor(element) {
    console.debug('\tSiteImpact EmailPreview');
    this.element = element;
    this.preview_frame = element.querySelector('#v-email_preview__frame');
    this.edit_button = element.querySelector('#v-email_preview__edit');
    this.cancel_button = element.querySelector('#v-email_preview__cancel');
    this.save_button = element.querySelector('#v-email_preview__save');
    this.opts = JSON.parse(element.dataset.emailOptions);
    this.editing = false;

    console.dir(this.opts);

    this.loadPreview();
    // TODO: set iframe height

    this.edit_button.addEventListener('click', this.toggleEditMode.bind(this));
    this.cancel_button.addEventListener('click', this.toggleEditMode.bind(this));
    // TODO: bind save event listener
    // TODO: bind send event listener
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
    this.preview_frame.setAttribute("src",this.opts.preview_url)
  }

  toggleEditMode() {
    this.editing = !this.editing;

    if (this.editing === true) {
      this.edit_button.classList.add('v-hidden');
      this.save_button.classList.remove('v-hidden');
      this.cancel_button.classList.remove('v-hidden');
    } else {
      this.edit_button.classList.remove('v-hidden');
      this.save_button.classList.add('v-hidden');
      this.cancel_button.classList.add('v-hidden');
    }

    if (this.editing) {
      console.log('Editing');
      // this.enableContentEditable();
    } else {
      console.log('Not editing');
      // this.disableContentEditable();
    }
  }

  editableFields() {
    return $("iframe.email-preview").contents().find('[data-contenteditable-identifier]')
  }

  bannerImage() {
    return $("iframe.email-preview").contents().find('th.banner').find('img');
  }

  subjectField() {
    return $('#subject');
  }

  fromField() {
    return $('#from');
  }

  iframeBody() {
    return $("iframe.email-preview").contents().find('body');
  }

  enableContentEditable() {
    var self = this;

    self.originalState = {};

    self.editableFields().each(function() {
      self.originalState[$(this).attr('data-contenteditable-identifier')] = $(this).html();
      $(this).addClass('editing');
      $(this).attr('contenteditable','true');
    });

    self.originalState['banner-image'] = self.bannerImage().parent().html();
    self.originalState['subject'] =  self.subjectField().val();
    self.originalState['from'] =  self.fromField().val();
    self.bannerImage().addClass('editing');
    self.subjectField().removeAttr('disabled');
    self.fromField().removeAttr('disabled');
    self.iframeBody().addClass('edit-mode');
  }

  disableContentEditable() {
    var self = this;

    self.editableFields().each(function() {
      $(this).removeClass('editing');
      $(this).attr('contenteditable','false');
    });

    self.bannerImage().removeClass('editing');
    self.subjectField().attr('disabled', 'disabled');
    self.fromField().attr('disabled', 'disabled');
    self.iframeBody().removeClass('edit-mode');
  }

  cancelEdits() {
    if (!confirm('Cancel your changes - this will revert your edits - are you sure?')) {
      return;
    }

    var self = this;

    self.editableFields().each(function() {
      $(this).html(self.originalState[$(this).attr('data-contenteditable-identifier')]);
    });
    self.bannerImage().parent().html(self.originalState['banner-image']);
    self.subjectField().val(self.originalState['subject']);
    self.fromField().val(self.originalState['from']);

    self.toggleEditMode();
  }

  saveEdits() {
    var changes = {}, self = this;
    self.editableFields().each(function() {
      changes[$(this).attr('data-contenteditable-identifier')] = $(this).html().trim();
    });

    var image_id = self.bannerImage().data('id');
    changes['subject'] = self.subjectField().val();
    changes['from'] = self.fromField().val();

    $.post(this.opts.persistUrl, {email_campaign_content: changes, email_campaign_image_id: image_id}, {dataType: 'json'})
      .done(function() {
        self.toggleEditMode();
        self.loadPreview();
      })
      .fail(function() {
        alert( "Oops - there was an error saving your changes!" );
      });
  }

  sendEmailPreview() {
    var $buttonText = $('#email-send-to-me span');
    var buttonContent = $buttonText.text()
    $buttonText.text('Sending...');
    $.post(this.opts.previewEmailUrl, {dataType: 'json'})
      .done(function(response) {
        alert(response.message);
        $buttonText.text(buttonContent);
      })
      .fail(function() {
        alert( "Oops - there was an error sending your mail!" );
      });
  }
}

// if (window.emailPreviewOptions) {
//   new emailPreview(window.emailPreviewOptions);
// }
