import I18n from 'react-native-i18n';
import '../../configs/translations';

describe('I18n', () => {
  it('loads correct localizations', () => {
    I18n.locale = 'en_US';
    expect(I18n.t('listSaved')).toBe('List saved');
    I18n.locale = 'ru';
    expect(I18n.t('listSaved')).toBe('Список сохранён');
  });
});
