def stub_authentication(user = nil)
  user ||= double('user')
  allow(request.env['warden']).to receive(:authenticate!).and_return(user)
  allow(controller).to receive(:current_user).and_return(user)
end
