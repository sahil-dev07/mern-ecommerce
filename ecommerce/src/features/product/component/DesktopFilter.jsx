import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'

export default function DesktopFilter({ handleFilter, filters, handleClearFilter }) {
    return (
        <form className="hidden lg:block">
            <button
                onClick={(e) => { handleClearFilter(e) }}
            >Clear Filter</button>
            {filters.map((section) => (
                <Disclosure
                    as="div"
                    key={section.id}
                    className="border-b border-gray-200 py-6"
                >
                    {({ open }) => (
                        <>
                            <h3 className="-my-3 flow-root">
                                <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                                    <span className="font-medium text-gray-900">
                                        {section.name}
                                    </span>
                                    <span className="ml-6 flex items-center">
                                        {open ? (
                                            <MinusIcon className="h-5 w-5" aria-hidden="true" />
                                        ) : (
                                            <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                        )}
                                    </span>
                                </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel className="pt-6">
                                <div className="space-y-4">
                                    {section.options.map((option, optionIdx) => (
                                        <div key={option.value} className="flex items-center">
                                            <input
                                                id={`filter-${section.id}-${optionIdx}`}
                                                name={`${section.id}[]`}
                                                defaultValue={option.value}
                                                type="checkbox"
                                                checked={option.checked}
                                                onChange={(e) => handleFilter(e, section, option)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label
                                                htmlFor={`filter-${section.id}-${optionIdx}`}
                                                className="ml-3 text-sm text-gray-600"
                                            >
                                                {option.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </Disclosure.Panel>
                        </>
                    )}
                </Disclosure>
            ))}
        </form>
    );
}
