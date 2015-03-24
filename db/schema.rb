# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150324033640) do

  create_table "editors", force: :cascade do |t|
    t.integer  "volume_id",  limit: 4
    t.integer  "user_id",    limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "editors_volumes", force: :cascade do |t|
    t.integer "editor_id", limit: 4
    t.integer "volume_id", limit: 4
  end

  add_index "editors_volumes", ["editor_id"], name: "index_editors_volumes_on_editor_id", using: :btree
  add_index "editors_volumes", ["volume_id"], name: "index_editors_volumes_on_volume_id", using: :btree

  create_table "posts", force: :cascade do |t|
    t.integer  "idx",        limit: 4,     default: -1
    t.integer  "volume_id",  limit: 4
    t.integer  "user_id",    limit: 4
    t.text     "content",    limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "timestamp",                default: '2010-12-26 15:45:50'
  end

  add_index "posts", ["created_at", "volume_id"], name: "posts_created_at", using: :btree
  add_index "posts", ["volume_id", "idx"], name: "posts_idx", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "login",                  limit: 255
    t.text     "name",                   limit: 65535
    t.string   "password",               limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "content_width",          limit: 255
    t.integer  "timezone",               limit: 4,     default: -8
    t.string   "email",                  limit: 255,   default: "", null: false
    t.string   "encrypted_password",     limit: 255,   default: "", null: false
    t.string   "reset_password_token",   limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          limit: 4,     default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip",     limit: 255
    t.string   "last_sign_in_ip",        limit: 255
  end

  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "volumes", force: :cascade do |t|
    t.integer  "parent_id",        limit: 4
    t.string   "url",              limit: 255,                                   null: false
    t.string   "title",            limit: 255,                                   null: false
    t.text     "title_html",       limit: 65535
    t.text     "description",      limit: 65535
    t.text     "css",              limit: 65535
    t.integer  "created_by",       limit: 4
    t.integer  "user_id",          limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "max_age",          limit: 4,     default: 0,                     null: false
    t.integer  "max_posts",        limit: 4,     default: 0,                     null: false
    t.integer  "meta_editors",     limit: 4,     default: 2,                     null: false
    t.integer  "post_editors",     limit: 4,     default: 0,                     null: false
    t.boolean  "anthology",        limit: 1
    t.boolean  "closed",           limit: 1
    t.boolean  "private",          limit: 1
    t.boolean  "insertions",       limit: 1,     default: true
    t.boolean  "inherit_css",      limit: 1,     default: true
    t.datetime "timestamp",                      default: '2010-12-26 15:45:49'
    t.text     "meta_description", limit: 65535
    t.string   "creator_name",     limit: 255
    t.string   "updated_by_id",    limit: 255
    t.string   "updated_by_name",  limit: 255
    t.string   "parent_name",      limit: 255
  end

end
