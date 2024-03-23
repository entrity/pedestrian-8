# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2015_03_28_031819) do

  create_table "editors", force: :cascade do |t|
    t.integer "volume_id"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "editors_volumes", force: :cascade do |t|
    t.integer "editor_id"
    t.integer "volume_id"
    t.index ["editor_id"], name: "index_editors_volumes_on_editor_id"
    t.index ["volume_id"], name: "index_editors_volumes_on_volume_id"
  end

  create_table "posts", force: :cascade do |t|
    t.integer "idx", default: -1
    t.integer "volume_id"
    t.integer "user_id"
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "timestamp"
    t.string "user_name", limit: 2048
  end

  create_table "users", force: :cascade do |t|
    t.string "login"
    t.text "name"
    t.string "password"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "content_width"
    t.integer "timezone"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "volumes", force: :cascade do |t|
    t.integer "parent_id"
    t.string "url"
    t.string "title"
    t.text "title_html"
    t.text "description"
    t.text "css"
    t.integer "created_by"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "max_age", default: 0
    t.integer "max_posts", default: 0
    t.integer "meta_editors", default: 2
    t.integer "post_editors", default: 0
    t.boolean "anthology"
    t.boolean "closed"
    t.boolean "private"
    t.boolean "insertions", default: true
    t.boolean "inherit_css", default: true
    t.datetime "timestamp"
    t.text "meta_description"
    t.string "creator_name"
    t.string "updated_by_id"
    t.string "updated_by_name"
    t.string "parent_name"
  end

end
