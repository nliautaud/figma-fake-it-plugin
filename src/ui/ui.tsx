import {
  Button,
  Checkbox,
  Columns,
  Container,
  Muted,
  render,
  Tabs,
  TabsOption,
  Text,
  Textbox,
  TextboxNumeric,
  Layer,
  TextboxAutocomplete,
  TextboxAutocompleteOption,
  VerticalSpace,
  IconLayerText16,
  IconCross32,
  IconButton,
  Link,
  Divider,
  IconLayerImage16
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { JSX, h } from 'preact'
import { useCallback, useState } from 'preact/hooks'

import '!./output.css'

function Select() {
  const [value, setValue] = useState<string>('foo');
  const icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512"><path fill="#fff" d="m478.33 433.6l-90-218a22 22 0 0 0-40.67 0l-90 218a22 22 0 1 0 40.67 16.79L316.66 406h102.67l18.33 44.39A22 22 0 0 0 458 464a22 22 0 0 0 20.32-30.4ZM334.83 362L368 281.65L401.17 362Zm-66.99-19.08a22 22 0 0 0-4.89-30.7c-.2-.15-15-11.13-36.49-34.73c39.65-53.68 62.11-114.75 71.27-143.49H330a22 22 0 0 0 0-44H214V70a22 22 0 0 0-44 0v20H54a22 22 0 0 0 0 44h197.25c-9.52 26.95-27.05 69.5-53.79 108.36c-31.41-41.68-43.08-68.65-43.17-68.87a22 22 0 0 0-40.58 17c.58 1.38 14.55 34.23 52.86 83.93c.92 1.19 1.83 2.35 2.74 3.51c-39.24 44.35-77.74 71.86-93.85 80.74a22 22 0 1 0 21.07 38.63c2.16-1.18 48.6-26.89 101.63-85.59c22.52 24.08 38 35.44 38.93 36.1a22 22 0 0 0 30.75-4.9Z" /></svg>
  const options: Array<TextboxAutocompleteOption> = [{
    value: 'foo'
  }, {
    value: 'bar'
  }, {
    value: 'baz'
  }, '-', {
    header: 'Header'
  }, {
    value: 'qux'
  }]
  function handleInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value
    setValue(newValue)
  }
  return <
    Container space='medium'>
    <TextboxAutocomplete filter icon={icon} variant="border" onInput={handleInput} options={options} value={value} />
    <VerticalSpace space="small" />
  </Container>
}

function TagSection() {
  const [value, setValue] = useState<boolean>(true);
  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.checked
    setValue(newValue)
  }
  return <
    Container space='medium'>
    <Container space='small'>
      <Checkbox onChange={handleChange} value={value}>
        <Text>Tag layers</Text>
      </Checkbox>
    </Container>
    {value && <TagLayerName />}
  </Container>
}
function TagLayerName() {
  const [value, setValue] = useState<string>('');
  function handleInput(event: JSX.TargetedEvent<HTMLInputElement>) {

  }
  return <div>
    <VerticalSpace space="small" />
    <Container space='extraSmall'
      style={{ backgroundColor: 'rgba(125,125,125,.2)' }}>
      <div class="flex items-center gap-2 p-1">
        <Muted><IconLayerText16 /></Muted>
        <Textbox onInput={handleInput} placeholder="Current name" value={value} variant="border" />
        <Text>*Airline.aircraftType</Text>
        <IconButton>
          <IconCross32 />
        </IconButton>
      </div>
    </Container>
  </div>
}

function CreateUI() {

  return <div class="flex flex-col flex-1 min-h-0">
    <VerticalSpace space="medium" />
    <Container space='medium'>
      <Text>
        <Muted>No layers selected</Muted>
      </Text>
      <VerticalSpace space="medium" />
    </Container>
    <Select />
    <Select />
    <VerticalSpace space="extraSmall" />
    <TagSection />
    <div class="flex-1"></div>
    <VerticalSpace space="extraLarge" />
    <Container space='medium'>
      <Button fullWidth>
        Create
      </Button>
    </Container>
  </div>
}

function UpdateUI() {

  return <div class="flex flex-col flex-1 min-h-0">
    <VerticalSpace space="medium" />
    <Container space='medium'>
      <Text>
        <Muted>No layers selected</Muted>
      </Text>
      <VerticalSpace space="medium" />
    </Container>
    <Divider />
    <div class="flex-1 overflow-y-auto">
      <Layer icon={<IconLayerText16 />} value={false}>Text</Layer>
      <Layer icon={<IconLayerText16 />} value={false}>Text</Layer>
      <Layer icon={<IconLayerImage16 />} value={false}>Text</Layer>
      <Layer icon={<IconLayerText16 />} value={false}>Text</Layer>
      <Layer icon={<IconLayerImage16 />} value={false}>Text</Layer>
      <Layer icon={<IconLayerText16 />} value={false}>Text</Layer>
      <Layer icon={<IconLayerText16 />} value={false}>Text</Layer>
      <Layer icon={<IconLayerText16 />} value={false}>Text</Layer>
      <Layer icon={<IconLayerText16 />} value={false}>Text</Layer>
      <Layer icon={<IconLayerText16 />} value={false}>Text</Layer>
      <Layer icon={<IconLayerText16 />} value={false}>Text</Layer>
    </div>
    <Divider />
    <VerticalSpace space="medium" />
    <Container space='medium'>
      <Button fullWidth>
        Create
      </Button>
    </Container>
  </div>
}

function AboutUI() {
  const icons = {
    'github': <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.00004 0.333344C6.12456 0.333344 5.25765 0.505782 4.44882 0.840813C3.63998 1.17584 2.90505 1.66691 2.286 2.28597C1.03575 3.53621 0.333374 5.2319 0.333374 7.00001C0.333374 9.94668 2.24671 12.4467 4.89337 13.3333C5.22671 13.3867 5.33337 13.18 5.33337 13V11.8733C3.48671 12.2733 3.09337 10.98 3.09337 10.98C2.78671 10.2067 2.35337 10 2.35337 10C1.74671 9.58668 2.40004 9.60001 2.40004 9.60001C3.06671 9.64668 3.42004 10.2867 3.42004 10.2867C4.00004 11.3 4.98004 11 5.36004 10.84C5.42004 10.4067 5.59337 10.1133 5.78004 9.94668C4.30004 9.78001 2.74671 9.20668 2.74671 6.66668C2.74671 5.92668 3.00004 5.33334 3.43337 4.86001C3.36671 4.69334 3.13337 4.00001 3.50004 3.10001C3.50004 3.10001 4.06004 2.92001 5.33337 3.78001C5.86004 3.63334 6.43337 3.56001 7.00004 3.56001C7.56671 3.56001 8.14004 3.63334 8.66671 3.78001C9.94004 2.92001 10.5 3.10001 10.5 3.10001C10.8667 4.00001 10.6334 4.69334 10.5667 4.86001C11 5.33334 11.2534 5.92668 11.2534 6.66668C11.2534 9.21334 9.69337 9.77334 8.20671 9.94001C8.44671 10.1467 8.66671 10.5533 8.66671 11.1733V13C8.66671 13.18 8.77337 13.3933 9.11337 13.3333C11.76 12.44 13.6667 9.94668 13.6667 7.00001C13.6667 6.12453 13.4943 5.25762 13.1592 4.44879C12.8242 3.63995 12.3331 2.90502 11.7141 2.28597C11.095 1.66691 10.3601 1.17584 9.55126 0.840813C8.74243 0.505782 7.87552 0.333344 7.00004 0.333344Z" fill="white" /></svg>,

    heart: <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.333374 4.09132C0.333374 7.33332 3.01337 9.06065 4.97471 10.6073C5.66671 11.1527 6.33337 11.6667 7.00004 11.6667C7.66671 11.6667 8.33337 11.1533 9.02537 10.6067C10.9874 9.06132 13.6667 7.33332 13.6667 4.09199C13.6667 0.849986 10 -1.44935 7.00004 1.66799C4.00004 -1.45001 0.333374 0.849319 0.333374 4.09132Z" fill="white" /></svg>
  }
  return <div>
    <Container space='medium'>
      <VerticalSpace space="small" />
      <Columns>
        <IconLink href="https://github.com/nliautaud/figma-fake-it-plugin" icon={icons.github}>Github</IconLink>
        <IconLink href="https://github.com/nliautaud/figma-fake-it-plugin/issues" icon={icons.github}>Issues</IconLink>
        <IconLink href="https://github.com/faker-js/faker" icon={icons.github}>Faker.js</IconLink>
        <IconLink href="https://github.com/sponsors/nliautaud/" icon={icons.heart}>Donate</IconLink>
      </Columns>
      <VerticalSpace space="small" />
      <div class="[&>*]:m-4">
        <p>Fake it is an open source plugin for Figma that leverages the Fakerjs library.</p>
        <p><strong>Running the plugin</strong></p>
        <p>Alternatively to this UI, you can run the plugin trough the quick action box, trough the menu Fake it  Quick or the shortcuts ⌘P and Ctrl-P or ⌘/ and Ctrl-/.</p>
        <p><strong>Tagging and Updating</strong></p>
        <p>Tagging adds a suffix to the layer names in order to refresh their content easily trough the Update tab of this UI or the menu Fake it  Update selected.</p>
        <p><strong>Languages</strong></p>
        <p>All 60+ languages of Fakerjs are available, but not all data is translated. English is then used as a fallback. Fakerjs is open to contributions.</p>
      </div>
    </Container>
  </div>
}
function IconLink(props: { href: string, icon: any, children: any }) {
  return <Link
    href={props.href}
    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white' }}>
    {props.icon}{props.children}
  </Link>
}

function Plugin() {
  const [tab, setTab] = useState<string>('Update');
  const tabs: Array<TabsOption> = [{
    children: null,
    value: 'Create'
  }, {
    children: null,
    value: 'Update'
  }, {
    children: null,
    value: 'About'
  }];
  const setActiveTab = (value: string) => {
    if (!value) return
    setTab(value)
    switch (value) {
      case 'About':
        emit('RESIZE', 470)
        break
      default:
        emit('RESIZE', 370)
        break
    }
  }
  setActiveTab(tab)

  return (
    <div class="flex flex-col h-full">
      <VerticalSpace space="medium" />
      <Select />
      <Tabs
        options={tabs}
        value={tab}
        class="[&_label:nth-child(2)]:flex-1"
        onChange={(event) => setActiveTab(event.currentTarget.value)}
      />
      {tab === 'Create' && <CreateUI />}
      {tab === 'Update' && <UpdateUI />}
      {tab === 'About' && <AboutUI />}
      <VerticalSpace space="medium" />
    </div>
  )
}

export default render(Plugin)
