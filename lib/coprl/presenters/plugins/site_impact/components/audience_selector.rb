# frozen_string_literal: true
require 'coprl/presenters/dsl/components/event_base'

module Coprl
  module Presenters
    module Plugins
      module SiteImpact
        module Components
          class AudienceSelector < DSL::Components::EventBase
            attr_reader :audience_options, :audience_ready_url, :audience_pending_message, :zip_code, :cpm,
                        :discount_cpm, :max_radius, :min_audience_selection, :max_audience_selection,
                        :selected_count_id, :selected_audience_size, :external_price_element, :currency_code

            def initialize(**attribs, &block)
              @audience_options = attribs.delete(:audience_options){ [] }
              @audience_ready_url = attribs.delete(:audience_ready_url)
              @audience_pending_message = attribs.delete(:audience_pending_message){ 'Please wait while we find your audience...' }
              @zip_code = attribs.delete(:zip_code)
              @cpm = attribs.delete(:cpm)
              @discount_cpm = attribs.delete(:discount_cpm)
              @max_radius = attribs.delete(:max_radius)
              @selected_count_id = attribs.delete(:selected_count_id)
              @min_audience_selection = attribs.delete(:min_audience_selection){ 1 }
              @max_audience_selection = attribs.delete(:max_audience_selection){ @audience_options.size - 1 }
              @selected_audience_size = attribs.delete(:selected_audience_size){ @min_audience_size }
              @external_price_element = attribs.delete(:external_price_element)
              @currency_code = attribs.delete(:currency_code){ 'USD' }
              super(type: :audience_selector, **attribs, &block)
              expand!
            end

            def slider_selection
              @audience_options.index{|e| e[:count] == @selected_audience_size}
            end
          end
        end
      end
    end
  end
end
