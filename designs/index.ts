import type { Design, DesignContext } from './types';
import type { WordData } from '../dictionary';
import { editorialDictionary } from './01-editorial-dictionary';
import { etymologyBreakdown } from './02-etymology-breakdown';
import { boldPoster } from './03-bold-poster';
import { risographStamp } from './04-risograph-stamp';
import { letterGrid } from './05-letter-grid';
import { wordInContext } from './08-word-in-context';
import { brutalistMono } from './09-brutalist-mono';
import { softPastelModern } from './10-soft-pastel-modern';
import { terminalOutput } from './20-terminal-output';
import { receipt } from './23-receipt';
import { diagnosticReadout } from './25-diagnostic-readout';
import { lexiconSpecimen } from './26-lexicon-specimen';
import { splitPanelEditorial } from './27-split-panel-editorial';
import { ticketStub } from './28-ticket-stub';
import { logOutput } from './29-log-output';
import { passportStamp } from './31-passport-stamp';
import { concertPoster } from './32-concert-poster';
import { taxForm } from './33-tax-form';
import { vinylRecord } from './34-vinyl-record';
import { patientChart } from './35-patient-chart';
import { boardingPass } from './36-boarding-pass';
import { wantedPoster } from './37-wanted-poster';
import { fieldJournal } from './38-field-journal';
import { qaSite } from './39-qa-site';
import { libraryCatalog } from './40-library-catalog';
import { pullRequest } from './41-pull-request';
import { labReport } from './42-lab-report';
import { vocabularyCertificate } from './44-vocabulary-certificate';
import { encyclopediaEntry } from './45-encyclopedia-entry';
import { policeLineup } from './46-police-lineup';
import { recipeCard } from './47-recipe-card';
import { subwayMap } from './48-subway-map';
import { patentFiling } from './49-patent-filing';
import { wikipediaInfobox } from './50-wikipedia-infobox';
import { postcard } from './51-postcard';
import { polaroid } from './52-polaroid';
import { crypticCrossword } from './53-cryptic-crossword';
import { vhsTitleCard } from './54-vhs-title-card';
import { stickyNotePile } from './55-sticky-note-pile';
import { telegram } from './56-telegram';
import { postageStamp } from './57-postage-stamp';
import { moviePoster } from './58-movie-poster';
import { teaBagTag } from './59-tea-bag-tag';
import { periodicElement } from './60-periodic-element';

export const ALL_DESIGNS: Design[] = [
  editorialDictionary,
  etymologyBreakdown,
  boldPoster,
  risographStamp,
  letterGrid,
  wordInContext,
  brutalistMono,
  softPastelModern,
  terminalOutput,
  receipt,
  diagnosticReadout,
  lexiconSpecimen,
  splitPanelEditorial,
  ticketStub,
  logOutput,
  passportStamp,
  concertPoster,
  taxForm,
  vinylRecord,
  patientChart,
  boardingPass,
  wantedPoster,
  fieldJournal,
  qaSite,
  libraryCatalog,
  pullRequest,
  labReport,
  vocabularyCertificate,
  encyclopediaEntry,
  policeLineup,
  recipeCard,
  subwayMap,
  patentFiling,
  wikipediaInfobox,
  postcard,
  polaroid,
  crypticCrossword,
  vhsTitleCard,
  stickyNotePile,
  telegram,
  postageStamp,
  moviePoster,
  teaBagTag,
  periodicElement,
];

export function pickDesign(data: WordData): Design {
  const eligible = ALL_DESIGNS.filter(d => d.canRender(data));
  const pool = eligible.length > 0 ? eligible : [boldPoster];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function renderDesign(design: Design, ctx: DesignContext): string {
  return design.render(ctx);
}
