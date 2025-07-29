# frozen_string_literal: true
require 'coprl/presenters/dsl/components/event_base'

module Coprl
  module Presenters
    module Plugins
      module SiteImpact
        module Components
          class EmailPreview < DSL::Components::EventBase
            attr_reader :preview_url, :persist_url, :button_edit_text, :button_save_text,
                        :button_cancel_text, :button_send_text, :button_color, :view_only,
                        :max_height
            def initialize(**attribs, &block)
              @preview_url = attribs.delete(:preview_url)
              @persist_url = attribs.delete(:persist_url)
              @button_edit_text = attribs.delete(:button_edit_text){ 'Edit' }
              @button_save_text = attribs.delete(:button_save_text){ 'Save' }
              @button_cancel_text = attribs.delete(:button_cancel_text){ 'Cancel' }
              @button_send_text = attribs.delete(:button_send_text){ nil }
              @button_color = attribs.delete(:button_color){ :primary }
              @view_only = attribs.delete(:view_only){ false }
              @max_height = attribs.delete(:max_height){ nil }
              super(type: :email_preview, **attribs, &block)
              expand!
            end

            def email_preview_options
              {preview_url: @preview_url, persist_url: @persist_url}
            end

          end
        end
      end
    end
  end
end
