import { Component, createEffect, createMemo, createSignal, For, Match, Switch } from 'solid-js';
import { ALL_LOCALES } from '../../../helpers/locales';
import { isValidLocale } from '../../../helpers/queststring_validation';
import { QuestString, LocaleName, QuestStringUpdator } from '../../../types';

type Props = {
  updateQuestString: QuestStringUpdator;
  questString?: QuestString;
  fieldName: string;
  questId: string;
};

type SelectEvent = Event & { target: Element; currentTarget: HTMLSelectElement };

export const QuestStringInput: Component<Props> = props => {
  const [currentLocale, setCurrentLocale] = createSignal<LocaleName | null>(null);

  createEffect(() => {
    if (typeof props.questString === 'object') {
      const localeName = (Object.keys(props.questString)[0] as LocaleName) ?? null;
      if (localeName) {
        setCurrentLocale(localeName);
      }
    }
    return props.questId;
  });

  const onChangeWhenString = (questString: QuestString | undefined) => (e: SelectEvent) => {
    const selectedValue = e.currentTarget.value;
    if (isValidLocale(selectedValue)) {
      setCurrentLocale(selectedValue);
      props.updateQuestString(() => ({ [selectedValue]: questString }));
    }
  };

  const onChangeWhenObject = (e: SelectEvent) => {
    const selectedValue = e.currentTarget.value;

    if (isValidLocale(selectedValue)) {
      setCurrentLocale(selectedValue);
    }
  };

  const inputValue = createMemo(() => {
    if (typeof props.questString === 'string') {
      return props.questString;
    }

    const locale = currentLocale();

    if (locale && typeof props.questString === 'object') {
      return props.questString[locale] ?? '';
    }

    return '';
  });

  const onInputChange = (e: InputEvent & { currentTarget: HTMLInputElement; target: Element }) => {
    const value = e.currentTarget.value;

    if (typeof props.questString === 'string' || props.questString === undefined) {
      props.updateQuestString(() => value);
      return;
    }

    const locale = currentLocale();

    if (locale && typeof props.questString === 'object') {
      props.updateQuestString(questString => {
        if (!questString || typeof questString === 'string') {
          return { [locale]: value };
        }
        return { ...questString, [locale]: value };
      });
    }
  };

  const renderLocaleValue = (localeName: LocaleName) => {
    if (typeof props.questString === 'object') {
      const locale = props.questString[localeName];
      return locale ? ` * : ${props.questString[localeName]}` : '';
    }
    return '';
  };

  return (
    <div style={{ padding: '15px' }}>
      <label
        style={{
          display: 'inline-block',
          float: 'left',
          clear: 'left',
          width: '120px',
          'text-align': 'right',
          'margin-right': '10px',
        }}
        for={`form_${props.fieldName}`}
      >
        {props.fieldName}:{' '}
      </label>
      <Switch>
        <Match when={typeof props.questString === 'string' || props.questString === undefined}>
          <select onChange={onChangeWhenString(props.questString)} style={{}}>
            <option value="set_locale">Set locale...</option>
            <For each={ALL_LOCALES}>
              {localeName => <option value={localeName}>{localeName}</option>}
            </For>
          </select>
        </Match>
        <Match when={typeof props.questString === 'object'}>
          <select onChange={onChangeWhenObject} style={{ 'max-width': '150px' }}>
            <For each={ALL_LOCALES}>
              {localeName => (
                <option selected={currentLocale() === localeName} value={localeName}>
                  {localeName}
                  {renderLocaleValue(localeName)}
                </option>
              )}
            </For>
          </select>
        </Match>
      </Switch>
      <input
        style={{ display: 'inline-block', float: 'left' }}
        onInput={onInputChange}
        value={inputValue()}
        type="text"
        id={`form_${props.fieldName}`}
      />
    </div>
  );
};
