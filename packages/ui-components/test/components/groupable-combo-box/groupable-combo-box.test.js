import { expect, fixture, html } from '@open-wc/testing';
import GroupableComboBox from '../../../src/components/groupable-combo-box/groupable-combo-box.js';
import CONSTANTS from '../../../src/constants.js';
import isRendered from '../../test-utils/isRendered.js';

const { NAME_RANK, TAGS_RANK, SECONDARY_INFO_RANK, DESC_RANK } = CONSTANTS;

const crossIcon = '.cross-icon';

const data = [
  {
    group: true,
    label: 'Group 1',
    items: [
      { label: 'App 1', value: 'app1' },
      { label: 'App 2', value: 'app2' },
    ],
  },
  {
    group: true,
    label: 'Group 2',
    items: [{ label: 'App 3', value: 'app3' }],
  },
];

describe('GroupableComboBox Component Tests', () => {
  let comboBox;
  let shadowRoot;
  const renderGroupableComboBox = async (comboBoxData) => {
    const template = html`
      <e-groupable-combo-box
        data-type="single"
        .data=${comboBoxData}
        width="350px"
      ></e-groupable-combo-box>
    `;
    const element = await fixture(template);
    await isRendered(element);
    return element;
  };

  before(() => {
    GroupableComboBox.register();
  });

  describe('Basic component setup', () => {
    it('should create a new <e-groupable-combo-box>', async () => {
      comboBox = await renderGroupableComboBox(data);
      ({ shadowRoot } = comboBox);

      expect(comboBox).to.not.null;
      expect(shadowRoot, 'Shadow root does not exist').to.exist;
    });

    it('should contain an input field', () => {
      const input = shadowRoot.querySelector('eui-text-field');
      expect(input).to.not.null;
    });

    it('should contain a cross icon', () => {
      const icon = shadowRoot.querySelector(crossIcon);
      expect(icon).to.not.null;
    });

    it('should render the expected menu items', () => {
      const expectedMenuItemLabels = data
        .map((group) => [group.label].concat(group.items.map((item) => item.label)))
        .flat();
      const menuItems = Array.from(shadowRoot.querySelectorAll('eui-menu-item'));
      const itemLabels = menuItems.map((item) => item.getAttribute('label'));

      expect(menuItems).to.have.lengthOf(expectedMenuItemLabels.length);
      expect(itemLabels).to.deep.equals(expectedMenuItemLabels);
    });
  });

  describe('Search logic component tests', () => {
    let groupableComboBox;
    const rankedItems = [
      {
        initial: [{ rank: 0 }],
        expectedSorted: [{ rank: 0 }],
        expectedMatches: [],
      },
      {
        initial: [{ rank: 0 }, { rank: 1 }],
        expectedSorted: [{ rank: 1 }, { rank: 0 }],
        expectedMatches: [{ rank: 1 }],
      },
      {
        initial: [{ rank: 2 }, { rank: 3 }],
        expectedSorted: [{ rank: 3 }, { rank: 2 }],
        expectedMatches: [{ rank: 2 }, { rank: 3 }],
      },
    ];

    before(() => {
      groupableComboBox = new GroupableComboBox();
    });

    it('can create comparable text', () => {
      const testString = 'AbAb';

      expect(groupableComboBox.getCompareString(testString)).to.eq(testString.toLowerCase());
      expect(groupableComboBox.getCompareString(undefined)).to.eq('');
    });

    it('can compare items', () => {
      rankedItems.forEach(({ initial, expectedSorted }) => {
        expect([...initial].sort(groupableComboBox.compareItems)).to.deep.eq(expectedSorted);
      });
    });

    it('can filter out unmatched results', () => {
      rankedItems.forEach(({ initial, expectedMatches }) => {
        const resultedMatches = groupableComboBox.getMatches(initial);
        if (!resultedMatches.length) {
          expect(resultedMatches).to.be.an('array').that.is.empty;
        } else {
          expect(resultedMatches).to.deep.eq(expectedMatches);
        }
      });
    });

    it('can rank items correctly', () => {
      const inputValue = 'find this';
      const item = { label: 'Just a label', tags: ['this is irrelevant'] };
      const item1 = { label: 'Bla bla find this' };
      const item2 = { label: 'Nothing here', tags: ['find this asd'] };
      const item3 = {
        label: 'Find this',
        descriptionLong: 'It should find this anyways.',
      };
      const item4 = {
        label: 'Can you find this?',
        tags: ['and find this'],
        descriptionLong: 'and find this as well?',
      };
      const item5 = {
        label: 'Can you find this?',
        tags: ['and find this'],
        descriptionLong: 'and find this as well?',
        descriptionShort: 'and also find this in secondary info.',
      };

      expect(groupableComboBox.rankItem(item, inputValue).rank).to.eq(0);
      expect(groupableComboBox.rankItem(item1, inputValue).rank).to.eq(NAME_RANK);
      expect(groupableComboBox.rankItem(item2, inputValue).rank).to.eq(TAGS_RANK);
      expect(groupableComboBox.rankItem(item3, inputValue).rank).to.eq(NAME_RANK + DESC_RANK);
      expect(groupableComboBox.rankItem(item4, inputValue).rank).to.eq(
        NAME_RANK + DESC_RANK + TAGS_RANK,
      );
      expect(groupableComboBox.rankItem(item5, inputValue).rank).to.eq(
        NAME_RANK + DESC_RANK + TAGS_RANK + SECONDARY_INFO_RANK,
      );
    });
  });
});
