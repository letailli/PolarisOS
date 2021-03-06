// @flow
const moment = require('moment');
const Utils = require('../../../utils/utils');
const EntitiesUtils = require('../../../utils/entities');

// HAL DOMAIN: shs.socio

async function get_hal_type(publication: Object): Promise<string> {
    const type = Utils.find_value_with_path(publication, 'type'.split('.'));
    const subtype = Utils.find_value_with_path(publication, 'subtype'.split('.'));
    const typology = await EntitiesUtils.retrieve_and_get_source('typology', type);

    if (!typology) {
        return 'UNDEFINED';
    }

    if (subtype) {
        const child = typology.children.find(c => c.name === 'subtype');
        if (child) {
            return child.hal || 'UNDEFINED';
        }
    }
    return typology.hal || 'UNDEFINED';
}

async function get_author_info(author: Object, publication: Object): Promise<string> {
    const author_id = author.label || '__dummy__';
    const author_info = await EntitiesUtils.retrieve_and_get_source('author', author_id);

    if (!author_info) {
        return '';
    }

    let role_info = await EntitiesUtils.retrieve_and_get_source('contributor_role', author.role);

    if (!role_info) {
        role_info = { hal: 'aut', value: 'author' };
    }

    const forename_ = author_info.firstname && author_info.firstname.trim() !== '' ?
        `<forename type="first">${author_info.firstname}</forename>` : '';

    return `<author role="${role_info.hal}">`
        + `<persName>${forename_}<surname>${author_info.lastname}</surname></persName></author>`;
}

async function get_title_stmt(publication: Object, tag: string = 'titleStmt'): Promise<string> {
    const lang = Utils.find_value_with_path(publication, 'lang'.split('.')).toLowerCase();

    // Titles
    const title = Utils.find_value_with_path(publication, 'title.content'.split('.'));
    const ttitles = Utils.find_value_with_path(publication, 'translated_titles'.split('.')) || [];

    const ok_ttitles = ttitles.filter(t => t.lang != null && t.lang.trim() !== '');

    let titles_ = [`<title xml:lang=${lang}>${title}</title>`];
    titles_ = titles_.concat(ok_ttitles.map(t => `<title xml:lang=${t.lang.toLowerCase()}>${t.content}</title>`));
    //------------------

    // Subtitles
    const subtitles = Utils.find_value_with_path(publication, 'subtitles'.split('.')) || [];

    const ok_subtitles = subtitles.filter(t => t.lang != null && t.lang.trim() !== '');

    const subtitles_ = ok_subtitles.map(t => `<title xml:lang=${t.lang.toLowerCase()}>${t.content}</title>`);
    //------------------

    const authors = Utils.find_value_with_path(publication, 'contributors'.split('.')) || [];

    const authors_ = await Promise.all(authors.map(a => get_author_info(a, publication)));

    let enclosure = `<${tag}>`;
    enclosure += titles_.join('\n');
    enclosure += subtitles_.join('\n');
    enclosure += authors_.join('\n');
    enclosure += `</${tag}>`;
    return enclosure;
}

async function get_edition_stmt(publication: Object): Promise<string> {
    const files = Utils.find_value_with_path(publication, 'files'.split('.')) || [];
    const dates = Utils.find_value_with_path(publication, 'dates'.split('.')) || {};
    if (files.length === 0) {
        return '';
    }
    const master = files.find(f => f.is_master) || files[0];
    if (master.restricted) {
        return '';
    }

    const written = `<date type="whenWritten">${moment(dates.publication).format('YYYY-MM-DD')}</date>`;


    let enclosure = '<editionStmt><edition>';
    enclosure += written;
    enclosure += '</edition></editionStmt>';
    return enclosure;
}

async function get_publication_stmt(publication: Object): Promise<string> {
    const license = Utils.find_value_with_path(publication, 'diffusion.rights.license'.split('.'));

    if (!license) {
        return '';
    }
    const license_info = await EntitiesUtils.retrieve_and_get_source('license', license);
    if (!license_info) {
        return '';
    }
    if (!license_info.hal || license_info.hal.trim() === '') {
        return '';
    }

    const license_ = `<licence target=${license_info.hal} />`;

    let enclosure = '<publicationStmt><availability>';
    enclosure += license_;
    enclosure += '</availability></publicationStmt>';
    return enclosure;
}

async function get_series_stmt(publication: Object): Promise<string> {
    return '';
    /* let enclosure = '<seriesStmt>';
    enclosure += '</seriesStmt>';
    return enclosure;*/
}

async function get_notes_stmt(publication: Object): Promise<string> {
    const description = Utils.find_value_with_path(publication, 'description'.split('.')) || '';
    const description_ = `<note type="description">${description}</description>`;

    let enclosure = '<notesStmt>';
    enclosure += description_;
    enclosure += '</notesStmt>';
    return enclosure;
}

async function get_monogr(publication: Object): Promise<string> {
    const ids = Utils.find_value_with_path(publication, 'ids'.split('.')) || [];
    const isbn = ids.find(id => id.type === 'isbn');
    const journal = Utils.find_value_with_path(publication, 'journal'.split('.')) || '__dummy__';
    const book_title = Utils.find_value_with_path(publication, 'publication_title'.split('.'));
    const dates = Utils.find_value_with_path(publication, 'dates'.split('.')) || {};
    const conference = Utils.find_value_with_path(publication, 'conference'.split('.')) || '__dummy__';
    const localisation = Utils.find_value_with_path(publication, 'localisation'.split('.')) || {};
    const editor = Utils.find_value_with_path(publication, 'editor'.split('.')) || '__dummy__';
    const institution = Utils.find_value_with_path(publication, 'delivery_institution'.split('.')) || '__dummy__';
    const volume = Utils.find_value_with_path(publication, 'volume'.split('.'));
    const issue = Utils.find_value_with_path(publication, 'number'.split('.'));
    const pagination = Utils.find_value_with_path(publication, 'pagination'.split('.'));
    const serie = Utils.find_value_with_path(publication, 'collection'.split('.'));

    const journal_info = await EntitiesUtils.retrieve_and_get_source('journal', journal);
    const conference_info = await EntitiesUtils.retrieve_and_get_source('conference', conference);
    const country_info = await EntitiesUtils.retrieve_and_get_source('country', localisation.country || '__dummy__');
    const editor_info = await EntitiesUtils.retrieve_and_get_source('editor', editor);
    const institution_info = await EntitiesUtils.retrieve_and_get_source('institution', institution);


    let journal_ = '';
    let isbn_ = '';
    let book_title_ = '';
    let meeting_ = '';
    let settlement_ = '';
    let country_ = '';
    let editor_ = '';
    let school_ = '';
    let institution_ = '';
    let imprint_ = '';

    if (journal_info) {
        const jids = Utils.find_value_with_path(journal_info, 'ids'.split('.')) || [];
        const jname = Utils.find_value_with_path(journal_info, 'name'.split('.')) || '';
        const issn = jids.find(id => id.type === 'issn');
        const eissn = jids.find(id => id.type === 'eissn');

        journal_ += `<title level="j">${jname}</title>`;
        if (issn) {
            journal_ += `<idno type="issn">${issn}</idno>`;
        }
        if (eissn) {
            journal_ += `<idno type="eissn">${eissn}</idno>`;
        }
    }

    if (isbn) {
        isbn_ = `<idno type="isbn">${isbn}</idno>`;
    }

    if (book_title) {
        book_title_ = `<title level="m">${book_title}</title>`;
    }

    if (localisation.city) {
        settlement_ += `<settlement>${localisation.city}</settlement>`;
    }

    if (country_info) {
        country_ += `<country key="${country_info.value}" />`;
    }

    if (conference_info) {
        meeting_ += `<title>${conference_info.name}</title>`;
        if (dates.start) {
            meeting_ += `<date type="start">${moment(dates.start).format('YYYY-MM-DD')}</date>`;
        }
        if (dates.end) {
            meeting_ += `<date type="end">${moment(dates.end).format('YYYY-MM-DD')}</date>`;
        }

        meeting_ += settlement_;
        meeting_ += country_;
    }

    if (editor_info) {
        editor_ = `<editor>${editor_info.label}</editor>`;
    }

    const hal_type = await get_hal_type(publication);

    if (institution_info && institution_info.name) {
        if (hal_type === 'HDR' || hal_type === 'THESE') {
            school_ = `<authority type="school">${institution_info.name}</authority>`;
        } else {
            institution_ = `<authority type="school">${institution_info.name}</authority>`;
        }
    }

    if (dates.publication) {
        imprint_ += `<date type="datePub">${moment(dates.publication).format('YYYY-MM-DD')}</date>`;
    }

    if (volume) {
        imprint_ += `<biblScope unit="volume">${volume}</biblScope>`;
    }

    if (serie) {
        imprint_ += `<biblScope unit="serie">${serie}</biblScope>`;
    }

    if (issue) {
        imprint_ += `<biblScope unit="issue">${issue}</biblScope>`;
    }

    if (pagination) {
        imprint_ += `<biblScope unit="pp">${pagination}</biblScope>`;
    }

    if (editor_info) {
        imprint_ += `<publisher>${editor_info.label}</publisher>`;
    }

    if (imprint_.trim() !== '') {
        imprint_ = `<imprint>${imprint_}</imprint>`;
    }

    return `<monogr>${journal_}${isbn_}${book_title_
         }${meeting_}${settlement_}${country_}${editor_}${school_}${institution_
         }${imprint_}</monogr>`;
}

async function get_source_desc(publication: Object): Promise<string> {
    const ids = Utils.find_value_with_path(publication, 'ids'.split('.')) || [];
    const doi = ids.find(id => id.type === 'doi');
    const handle = ids.find(id => id.type === 'handle');


    const analytic_ = await get_title_stmt(publication, 'analytic');
    const monogr_ = await get_monogr(publication);

    const doi_ = doi ? `<idno type="doi">${doi._id}</idno>` : '';
    const handle_ = handle ? `<idno type="uri">${handle._id}</idno>` : '';
    const bibl_ = doi_ + handle_ + monogr_ + analytic_;
    const recording_ = '';

    let enclosure = `<sourceDesc><biblStruct>${bibl_}</biblStruct>`;
    enclosure += `<recordingStmt>${recording_}</recordingStmt></sourceDesc>`;
    return enclosure;
}

async function get_profile_desc(publication: Object): Promise<string> {
    const hal_type = await get_hal_type(publication);
    const abstracts = Utils.find_value_with_path(publication, 'abstracts'.split('.')) || [];
    const keywords = Utils.find_value_with_path(publication, 'keywords'.split('.')) || [];
    const lang = Utils.find_value_with_path(publication, 'lang'.split('.'));
    const ok_abstracts = abstracts.filter(t => t.lang != null && t.lang.trim() !== '');

    const user_keywords = keywords.filter(k => k.type === 'user');

    const abstracts_ = ok_abstracts.map(a => `<abstract xml:lang="${a.lang.toLowerCase()}">${a.content}</abstract>`).join('\n');

    const lang_usage_ = `<langUsage ident="${lang.toLowerCase()}" />`;

    let keywords_ = '<keywords scheme="author">';
    keywords_ += user_keywords.map(k => `<term xml:lang="en">${k.value}</term>`).join('\n');
    keywords_ += '</keywords';

    let text_class_ = '<classCode scheme="halDomain" n="shs.socio" />';
    text_class_ += `<classCode scheme="halTypology" n="${hal_type}" />`;
    text_class_ += keywords_;


    let enclosure = '<profileDesc>';
    enclosure += lang_usage_;
    enclosure += text_class_;
    enclosure += abstracts_;
    enclosure += '</profileDesc>';
    return enclosure;
}

async function transform_publication_to_hal(publication: Object): Promise<string> {
    const title = await get_title_stmt(publication);
    const edition = '';// await get_edition_stmt(publication);
    const publi = await get_publication_stmt(publication);
    const series = await get_series_stmt(publication);
    const notes = await get_notes_stmt(publication);
    const source = await get_source_desc(publication);
    const profile = await get_profile_desc(publication);
    const info = title + edition + publi + series + notes + source + profile;

    let enclosure = '<TEI xmlns="http://www.tei-c.org/ns/1.0" xmlns:hal="http://hal.archives-ouvertes.fr">';
    enclosure += '<text>';
    enclosure += '<body>';
    enclosure += `<listBibl><biblFull>${info}<biblFull></listBibl>`;
    enclosure += '<back></back>';
    enclosure += '</body>';
    enclosure += '</text>';
    enclosure += '</TEI>';

    return enclosure;
}

module.exports = {
    transform_publication_to_hal,
};
