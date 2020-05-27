# Bible Aggregator

## Purpose

The purpose of this app is to aggregate multiple bibles into single page web.
Although, there are many applications of this, (mobile app, webapp), still, it is hard to find proper bible app suit to me

## Features

The requirement of this applications can;
- see whole bibles at once(future)
- locate verses, chapter, book easily(ongoing)
- open bibles quickly(done)
- mark & unmark verses easily, and also saved, so when user got back, the things should be there.(done)
- leave note(future)
- easily share the phrases(ongoing, currently only for clipboard copy)
- search verse, with query text highlighted(ongoing)

## Domain Design

- `Bible`: Collections of books
- `Book`: Collections of chapters
- `Chapter`: Collections of verses
- `Verses`: A text phrase

Our familiar notation for location of verse can be represented as follows.
`John 3:16 NRSV`

This can be interpreted as follows:
NRSV Bible -> John Book -> 3 Chapter -> 16 Verse

And, if user want to choose multiple query then,:
`John 3:16-21 NIV`
This is,
NIV Bible -> John -> 3 Chapter -> range 16, 21 Verses

## Data file structure

Bible_[Language]_[Version].spb
Language can be Korean, English
Version can be NRSV, NIV, KJV, KNRSV, KNIV

## Install

- This requires your server to operate it
  * Especially, selenium, chrome should be supported. Currently, webapp does not support IE.
- Run
1. run server on local or somewhere

```bash
$ sbt run
...
# will show you host address shortly.
http://localhost:9000
```

2. Access to the address.
- it would take some time for first time, since it should calculate heights of each chapters in bible.
