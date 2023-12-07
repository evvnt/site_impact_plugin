# frozen_string_literal: true
require 'coprl/presenters/dsl/components/event_base'

module Coprl
  module Presenters
    module Plugins
      module SiteImpact
        module Components
          class EmailPreview < DSL::Components::EventBase
            attr_reader :preview_url, :persist_url, :preview_email_url, :button_edit_text, :button_save_text, :button_cancel_text, :button_color
            def initialize(**attribs, &block)
              @preview_url = attribs.delete(:preview_url)
              @persist_url = attribs.delete(:persist_url)
              @preview_email_url = attribs.delete(:preview_email_url)
              @button_edit_text = attribs.delete(:button_edit_text){ 'Edit' }
              @button_save_text = attribs.delete(:button_save_text){ 'Save' }
              @button_cancel_text = attribs.delete(:button_cancel_text){ 'Cancel' }
              @button_color = attribs.delete(:button_color){ :primary }
              @component_options = %i(preview_url persist_url preview_email_url)
              super(type: :email_preview, **attribs, &block)
              expand!
            end

            def email_preview_options
              @component_options.map do |key|
                if (value = send(key))
                  [key, value]
                end
              end.compact.to_h
            end

          end
        end
      end
    end
  end
end
