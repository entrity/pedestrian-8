Rails.application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  root 'home#index'

  devise_for :users, controllers:{sessions:'devise_overrides/sessions', passwords:'devise_overrides/passwords'}
  devise_scope :user do
    get 'signout' => 'devise_overrides/sessions#destroy'
  end

  resources :users, only:[:show, :update]

  resources :editors
  resources :posts
  resources :uploads, fname: /[^\/]+/, only:[:index] do
    collection do
      get 'lg/:fname', action: :lg
      get 'med/:fname', action: :med
      get 'sm/:fname', action: :sm
    end
  end
  resources :volumes do
    member do
      get 'children'
      get 'posts'
    end
  end
end
