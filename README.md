# Bible Aggregator

## Purpose

The purpose of this app is to aggregate multiple bibles into single page web.
Although, there are many applications of this, (mobile app, webapp), still, it is hard to find proper bible app suit to me

## Requirements

The requirement of this applications are;
- The user should be able to see whole bibles at once
- The user should be able to locate easily

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
