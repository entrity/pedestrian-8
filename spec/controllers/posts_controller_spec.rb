require 'spec_helper'
require 'support/authentication'

RSpec.describe(PostsController) do
  let(:parent) { Volume.create! title: 'Parent', parent: nil, updated_at: timestamp, updated_by_name: 'Matthias', updated_by_id: -1 }
  let(:volume) { Volume.create title: 'Vol', parent: parent, updated_at: timestamp, updated_by_name: 'Matthias', updated_by_id: -1 }
  let(:user) { User.create login: 'logalog', name: 'Logalog', password: 'dbGs85aPkYYnd0Dc', password_confirmation: 'dbGs85aPkYYnd0Dc', email: 'bri@njaq.ues' }
  let(:timestamp) { 2.years.ago }

  describe '#create' do
    it 'updates Volume fields' do
      stub_authentication(user)
      expect {
        post :create, volume_id: volume.id, content: 'a golden chalice', format: :json
      }.to change { volume.reload.updated_by_name }.
        from('Matthias').
        to('Logalog').
      and change { volume.updated_by_id }.
        from("-1").to(user.id.to_s).
      and change { Time.now - volume.updated_at.round }.
        to be < 2
    end
  end
end
